from fastapi import APIRouter, Depends
from sqlmodel import select

from ..models import Swipe, Movie
from ..db import get_session

router = APIRouter()

@router.post("/", response_model=Swipe, status_code=201)
@router.post("", response_model=Swipe, status_code=201)
def create_swipe(swipe: Swipe, session=Depends(get_session)):
    session.add(swipe)
    session.commit()
    session.refresh(swipe)
    return swipe


@router.get("/{user_id}/history/")
@router.get("/{user_id}/history")
def get_swipe_history(user_id: int, session=Depends(get_session)):
    """Get swipe history with movie details for a user"""
    swipes = session.exec(
        select(Swipe, Movie)
        .join(Movie, Swipe.movie_id == Movie.id)
        .where(Swipe.user_id == user_id)
        .order_by(Swipe.ts.desc())
    ).all()
    
    result = []
    for swipe, movie in swipes:
        result.append({
            "user_id": swipe.user_id,
            "movie_id": swipe.movie_id,
            "direction": swipe.direction,
            "ts": swipe.ts,
            "movie": {
                "id": movie.id,
                "title": movie.title,
                "poster_url": movie.poster_url,
                "year": movie.year,
                "genres": movie.genres,
                "overview": movie.overview,
                "score": movie.score
            }
        })
    
    return result


@router.delete("/{user_id}/", status_code=204)
@router.delete("/{user_id}", status_code=204)
def clear_swipe_history(user_id: int, session=Depends(get_session)):
    """Clear all swipe history for a user"""
    swipes = session.exec(select(Swipe).where(Swipe.user_id == user_id)).all()
    for swipe in swipes:
        session.delete(swipe)
    session.commit()
    return None


@router.delete("/{user_id}/{movie_id}", status_code=204)
@router.delete("/{user_id}/{movie_id}/", status_code=204)
def delete_swipe(user_id: int, movie_id: int, session=Depends(get_session)):
    """Delete a swipe for a user and movie"""
    swipe = session.exec(select(Swipe).where(Swipe.user_id == user_id, Swipe.movie_id == movie_id)).first()
    if swipe:
        session.delete(swipe)
        session.commit()


@router.get("/{user_id}/", response_model=list[Swipe])
@router.get("/{user_id}", response_model=list[Swipe])
def get_swipes(user_id: int, session=Depends(get_session)):
    swipes = session.exec(select(Swipe).where(Swipe.user_id == user_id)).all()
    return swipes