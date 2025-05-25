import pandas as pd
import pickle
import base64
import os
import sys
import asyncio
import aiohttp
import logging
import argparse
from pathlib import Path
from datetime import datetime
from sqlalchemy import text
import kagglehub
from kagglehub import KaggleDatasetAdapter

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the parent directory to sys.path to allow imports from app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db import engine, prod_engine, Session
from app.models import Movie
from app.recommender import MovieEmbedding

# TMDB API configuration
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"


class MoviePosterFetcher:
    """Handles fetching movie poster URLs from TMDB API."""
    
    def __init__(self):
        self.api_available = bool(TMDB_API_KEY and TMDB_API_KEY != "your_api_key")
        if not self.api_available:
            logger.warning("TMDB_API_KEY not available - skipping poster fetching")
        self.session = None
        
    async def __aenter__(self):
        if self.api_available:
            self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def get_poster_url(self, title: str, year: int = None) -> str | None:
        """Get poster URL for a movie."""
        if not self.api_available:
            return None
            
        try:
            url = f"{TMDB_BASE_URL}/search/movie"
            params = {
                "api_key": TMDB_API_KEY,
                "query": title,
                "include_adult": "false"
            }
            
            if year and isinstance(year, int) and year > 0:
                params["year"] = year
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get("results", [])
                    if results and results[0].get("poster_path"):
                        return f"{TMDB_IMAGE_BASE_URL}{results[0]['poster_path']}"
                else:
                    logger.warning(f"API request failed for {title}: {response.status}")
            
        except Exception as e:
            logger.error(f"Error fetching poster for {title}: {e}")
        
        return None


def extract_year(date_str):
    """Extract year from a date string."""
    if pd.isna(date_str):
        return None
    try:
        return int(date_str.strip().split('/')[-1])
    except:
        return None


def load_and_clean_dataset(count: int = 50):
    """Load and clean the movie dataset."""
    logger.info("Loading dataset from Kaggle...")
    df = kagglehub.dataset_load(
        KaggleDatasetAdapter.PANDAS,
        "ashpalsingh1525/imdb-movies-dataset",
        "imdb_movies.csv",
    )
    
    # Clean dataset
    df = df.copy()
    df['year'] = df['date_x'].apply(extract_year)
    df['overview'] = df['overview'].fillna('')
    df['genre'] = df['genre'].fillna('')
    df = df[df['names'].notna() & (df['names'] != '')]
    df = df.rename(columns={'names': 'title'})
    
    # Filter and limit
    df = df[df['score'] > 75].head(count)
    logger.info(f"Prepared {len(df)} movies for seeding")
    
    return df


async def seed_database(df: pd.DataFrame, fetch_posters: bool = False, batch_size: int = 32, db_engine=None):
    """Seed database with movie data, optionally including poster URLs."""
    
    # Use provided engine or default to regular engine
    selected_engine = db_engine if db_engine is not None else engine
    
    # Check if movies already exist
    with Session(selected_engine) as session:
        if session.exec(text("SELECT 1 FROM movie LIMIT 1")).first():
            logger.info("Movies already exist in database. Skipping seeding.")
            return
    
    # Generate embeddings
    logger.info("Generating embeddings...")
    embedding_model = MovieEmbedding()
    movies_dict = df.to_dict('records')
    embeddings = embedding_model.generate_embeddings_batch(movies_dict, batch_size)
    
    # Seed database
    poster_fetcher = None
    if fetch_posters:
        poster_fetcher = MoviePosterFetcher()
        await poster_fetcher.__aenter__()
    
    try:
        with Session(selected_engine) as session:
            for i, (_, row) in enumerate(df.iterrows()):
                logger.info(f"Processing {i+1}/{len(df)}: {row['title']}")
                
                # Fetch poster URL if requested
                poster_url = None
                if fetch_posters and poster_fetcher:
                    poster_url = await poster_fetcher.get_poster_url(row['title'], row['year'])
                    if poster_url:
                        logger.info(f"Found poster: {poster_url}")
                    else:
                        logger.warning(f"No poster found for {row['title']}")
                    
                    # Rate limiting
                    await asyncio.sleep(0.25)
                
                # Create movie record
                embedding_bytes = pickle.dumps(embeddings[i].tolist())
                embedding_str = base64.b64encode(embedding_bytes).decode('utf-8')
                
                movie = Movie(
                    title=row['title'],
                    year=row['year'],
                    genres=row['genre'],
                    overview=row['overview'],
                    score=row['score'],
                    poster_url=poster_url,
                    embedding_vector=embedding_str
                )
                
                session.add(movie)
                
                # Commit in batches
                if (i + 1) % 10 == 0:
                    session.commit()
                    logger.info(f"Committed batch of 10 movies")
            
            # Final commit
            session.commit()
            logger.info(f"Successfully seeded {len(df)} movies")
            
    finally:
        if poster_fetcher:
            await poster_fetcher.__aexit__(None, None, None)


async def main():
    """Main function with command-line argument parsing."""
    parser = argparse.ArgumentParser(description='Seed database with movie data and embeddings')
    parser.add_argument(
        '--count', '-c', 
        type=int, 
        default=50, 
        help='Number of movies to seed (default: 50)'
    )
    parser.add_argument(
        '--posters', '-p', 
        action='store_true', 
        help='Fetch poster URLs from TMDB API'
    )
    
    parser.add_argument(
        '--production_db', '-P',
        action='store_true',
        help='Use production database'
    )
    
    args = parser.parse_args()
    
    # Determine which database engine to use
    db_engine = prod_engine if args.production_db else engine
    db_type = "production" if args.production_db else "development"
    
    logger.info(f"Starting database seeding at {datetime.now()}")
    logger.info(f"Count: {args.count}, Fetch posters: {args.posters}, Database: {db_type}")
    
    # Load and prepare data
    df = load_and_clean_dataset(args.count)
    
    # Seed database
    await seed_database(df, fetch_posters=args.posters, db_engine=db_engine)
    
    logger.info(f"Database seeding completed at {datetime.now()}")


if __name__ == "__main__":
    asyncio.run(main()) 