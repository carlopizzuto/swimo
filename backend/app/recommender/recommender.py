import numpy as np
from typing import List, Dict, Any, Optional
import pickle
from sklearn.metrics.pairwise import cosine_similarity

class MovieRecommender:
    def __init__(self, embeddings_path: str = None):
        """Initialize the movie recommender with precomputed embeddings.
        
        Args:
            embeddings_path: Path to the pickled embeddings file
        """
        self.movie_data = None
        self.embeddings = None
        self.movie_ids = None
        
        if embeddings_path:
            self.load_embeddings(embeddings_path)
    
    def load_embeddings(self, path: str) -> None:
        """Load embeddings from a pickle file.
        
        Args:
            path: Path to the pickled embeddings file
        """
        with open(path, 'rb') as f:
            data = pickle.load(f)
            self.embeddings = data['embeddings']
            self.movie_data = data['movies']
            self.movie_ids = data['movie_ids']
    
    def get_recommendations(self, liked_movie_ids: List[int], disliked_movie_ids: List[int] = None, top_n: int = 5) -> List[int]:
        """Get movie recommendations based on liked and disliked movies.
        
        Args:
            liked_movie_ids: List of IDs of movies the user liked
            disliked_movie_ids: List of IDs of movies the user disliked
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended movie IDs
        """
        if not self.embeddings or not self.movie_ids:
            raise ValueError("Embeddings not loaded. Call load_embeddings first.")
        
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