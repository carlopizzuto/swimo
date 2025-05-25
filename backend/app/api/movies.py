from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session
from random import choice
from typing import List

from ..db import engine, get_session
from ..models import Movie, Swipe
from ..recommender.recommender import MovieRecommender

router = APIRouter()

# Lazy-loaded recommender instance
_recommender = None

def get_recommender():
    global _recommender
    if _recommender is None:
        try:
            _recommender = MovieRecommender()
        except ValueError as e:
            raise HTTPException(status_code=500, detail=f"Failed to load embeddings from database: {str(e)}")
    return _recommender

@router.get("/random/", response_model=Movie)
@router.get("/random", response_model=Movie)
def random_movie(session=Depends(get_session)):
    ids = session.exec(select(Movie.id)).all()
    movie = session.get(Movie, choice(ids))
    return movie

@router.get("/recommend/", response_model=List[Movie])
def recommend_movies(user_id: int = 2, top_n: int = 5, session=Depends(get_session)):
    """
    Get movie recommendations based on user's swipe history.
    Uses database-stored embeddings only (no pickle files).
    """
    # Get user's swipe history
    liked_query = select(Swipe.movie_id).where(Swipe.user_id == user_id, Swipe.direction == True)
    liked_movie_ids = session.exec(liked_query).all()
    
    disliked_query = select(Swipe.movie_id).where(Swipe.user_id == user_id, Swipe.direction == False)
    disliked_movie_ids = session.exec(disliked_query).all()
    
    # If user has no likes, return random movies
    if not liked_movie_ids:
        ids = session.exec(select(Movie.id)).all()
        recommended_ids = [choice(ids) for _ in range(min(top_n, len(ids)))]
    else:
        # Get recommendations using the database-only recommender
        recommender = get_recommender()
        recommended_ids = recommender.get_recommendations(
            liked_movie_ids=liked_movie_ids,
            disliked_movie_ids=disliked_movie_ids,
            top_n=top_n
        )
    
    # Get the recommended movies from database
    recommended_movies = []
    for movie_id in recommended_ids:
        movie = session.get(Movie, movie_id)
        if movie:
            recommended_movies.append(movie)
    
    return recommended_movies 