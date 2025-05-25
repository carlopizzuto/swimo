from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any, Optional

class MovieEmbedding:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize the embedding model.
        
        Args:
            model_name: Name of the sentence-transformer model to use
        """
        self.model = SentenceTransformer(model_name)
    
    def create_movie_text(self, movie: Dict[str, Any]) -> str:
        """Create a text representation of a movie for embedding.
        
        Args:
            movie: Dictionary containing movie information
            
        Returns:
            A string representation combining title, genres, and overview
        """
        title = movie.get('names', '')
        genres = movie.get('genre', '')
        overview = movie.get('overview', '')
        
        return f"{title}. {genres}. {overview}"
    
    def embed_movies(self, movies: List[Dict[str, Any]]) -> List[np.ndarray]:
        """Generate embeddings for a list of movies.
        
        Args:
            movies: List of movie dictionaries
            
        Returns:
            List of embedding vectors
        """
        texts = [self.create_movie_text(movie) for movie in movies]
        embeddings = self.model.encode(texts)
        return embeddings
    
    def generate_embeddings_batch(self, movies: List[Dict[str, Any]], batch_size: int = 32) -> List[np.ndarray]:
        """Generate embeddings in batches to reduce memory usage.
        
        Args:
            movies: List of movie dictionaries
            batch_size: Number of movies to process at once
            
        Returns:
            List of embedding vectors
        """
        all_embeddings = []
        
        for i in range(0, len(movies), batch_size):
            batch = movies[i:i+batch_size]
            batch_embeddings = self.embed_movies(batch)
            all_embeddings.extend(batch_embeddings)
            
        return all_embeddings 