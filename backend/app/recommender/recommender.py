import numpy as np
from typing import List, Dict, Any, Optional
import pickle
import base64
from sklearn.metrics.pairwise import cosine_similarity
from sqlmodel import Session, select
from ..models import Movie
from ..db import engine

class MovieRecommender:
    def __init__(self):
        """Initialize the movie recommender that loads embeddings from database."""
        self.embeddings = None
        self.movie_ids = None
        self.load_embeddings_from_db()
    
    def load_embeddings_from_db(self) -> None:
        """Load embeddings from the database."""
        with Session(engine) as session:
            # Get all movies with embeddings
            movies = session.exec(
                select(Movie).where(Movie.embedding_vector.is_not(None))
            ).all()
            
            if not movies:
                raise ValueError("No movies with embeddings found in database")
            
            # Decode embeddings
            embeddings_list = []
            movie_ids_list = []
            
            for movie in movies:
                try:
                    # Decode base64 and unpickle
                    embedding_bytes = base64.b64decode(movie.embedding_vector.encode('utf-8'))
                    embedding = pickle.loads(embedding_bytes)
                    
                    # Convert to numpy array if it's a list
                    if isinstance(embedding, list):
                        embedding = np.array(embedding)
                    
                    embeddings_list.append(embedding)
                    movie_ids_list.append(movie.id)
                    
                except Exception as e:
                    print(f"Error decoding embedding for movie {movie.id}: {e}")
                    continue
            
            # Convert to numpy array for efficient operations
            self.embeddings = np.array(embeddings_list)
            self.movie_ids = movie_ids_list
            
            print(f"Loaded {len(self.movie_ids)} movie embeddings from database")
    
    def get_recommendations(self, liked_movie_ids: List[int], disliked_movie_ids: List[int] = None, top_n: int = 5) -> List[int]:
        """Get movie recommendations based on liked and disliked movies.
        
        Args:
            liked_movie_ids: List of IDs of movies the user liked
            disliked_movie_ids: List of IDs of movies the user disliked
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended movie IDs
        """
        if self.embeddings is None or not self.movie_ids:
            raise ValueError("Embeddings not loaded from database")
        
        # Convert movie IDs to indices in our embedding matrix
        liked_indices = [self.movie_ids.index(movie_id) for movie_id in liked_movie_ids if movie_id in self.movie_ids]
        
        if not liked_indices:
            # If no valid liked movies, return random recommendations
            import random
            return random.sample(self.movie_ids, min(top_n, len(self.movie_ids)))
        
        # Average the embeddings of liked movies
        liked_embeddings = [self.embeddings[idx] for idx in liked_indices]
        user_profile = np.mean(liked_embeddings, axis=0).reshape(1, -1)
        
        # If we have disliked movies, penalize them
        if disliked_movie_ids:
            disliked_indices = [self.movie_ids.index(movie_id) for movie_id in disliked_movie_ids if movie_id in self.movie_ids]
            if disliked_indices:
                disliked_embeddings = [self.embeddings[idx] for idx in disliked_indices]
                disliked_profile = np.mean(disliked_embeddings, axis=0).reshape(1, -1)
                # Move away from disliked movies
                user_profile = user_profile - disliked_profile
        
        # Calculate similarity scores
        similarities = cosine_similarity(user_profile, self.embeddings).flatten()
        
        # Create a list of (movie_id, similarity) tuples, excluding already seen movies
        seen_indices = liked_indices + (disliked_indices if disliked_movie_ids else [])
        movie_scores = [(self.movie_ids[i], similarities[i]) for i in range(len(similarities)) if i not in seen_indices]
        
        # Sort by similarity and return top_n
        movie_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [movie_id for movie_id, _ in movie_scores[:top_n]] 