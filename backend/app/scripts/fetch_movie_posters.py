import asyncio
import aiohttp
import csv
import sys
from pathlib import Path
from sqlmodel import select

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db import engine, Session
from app.models import Movie
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# TMDB API configuration
TMDB_API_KEY = "your_api_key" 
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"  # w500 for medium quality posters

class MoviePosterFetcher:
    def __init__(self):
        if not TMDB_API_KEY:
            raise ValueError("TMDB_API_KEY environment variable is required")
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_movie(self, title: str, year: int = None) -> dict | None:
        """Search for a movie on TMDB and return the first result"""
        try:
            url = f"{TMDB_BASE_URL}/search/movie"
            params = {
                "api_key": TMDB_API_KEY,
                "query": title,
                "include_adult": "false"
            }
            
            # Only add year if it's a valid integer
            if year and isinstance(year, int) and year > 0:
                params["year"] = year
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get("results", [])
                    if results:
                        return results[0]  # Return first result
                else:
                    logger.warning(f"API request failed for {title}: {response.status}")
            
        except Exception as e:
            logger.error(f"Error searching for movie {title}: {e}")
        
        return None
    
    def get_poster_url(self, poster_path: str) -> str | None:
        """Convert TMDB poster path to full URL"""
        if poster_path:
            return f"{TMDB_IMAGE_BASE_URL}{poster_path}"
        return None

async def update_movie_posters():
    """Update poster URLs for all movies in the database"""
    
    async with MoviePosterFetcher() as fetcher:
        with Session(engine) as session:
            # Get all movies without poster URLs
            statement = select(Movie).where(Movie.poster_url.is_(None))
            movies = session.exec(statement).all()
            
            logger.info(f"Found {len(movies)} movies without poster URLs")
            
            for i, movie in enumerate(movies):
                try:
                    logger.info(f"Processing {i+1}/{len(movies)}: {movie.title} (year: {movie.year})")
                    
                    # Search for the movie
                    movie_data = await fetcher.search_movie(movie.title, movie.year)
                    
                    if movie_data and movie_data.get("poster_path"):
                        poster_url = fetcher.get_poster_url(movie_data["poster_path"])
                        movie.poster_url = poster_url
                        session.add(movie)
                        logger.info(f"Found poster for {movie.title}: {poster_url}")
                    else:
                        logger.warning(f"No poster found for {movie.title}")
                    
                    # Rate limiting: wait 0.25 seconds between requests (4 requests per second)
                    await asyncio.sleep(0.25)
                    
                    # Commit in batches of 10
                    if (i + 1) % 10 == 0:
                        session.commit()
                        logger.info(f"Committed batch of 10 movies")
                        
                except Exception as e:
                    logger.error(f"Error processing movie {movie.title}: {e}")
                    continue
            
            # Final commit
            session.commit()
            logger.info("Finished updating movie posters")

async def update_csv_with_posters():
    """Alternative: Update the CSV file directly with poster URLs"""
    if not TMDB_API_KEY:
        logger.error("TMDB_API_KEY not found in environment variables")
        return
    
    csv_path = "backend/app/data/imdb_movies.csv"
    output_path = "backend/app/data/imdb_movies_with_posters.csv"
    
    async with MoviePosterFetcher() as fetcher:
        with open(csv_path, 'r', encoding='utf-8') as infile, \
             open(output_path, 'w', encoding='utf-8', newline='') as outfile:
            
            reader = csv.DictReader(infile)
            fieldnames = reader.fieldnames + ['poster_url']
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for i, row in enumerate(reader):
                if i >= 100:  # Limit for testing
                    break
                    
                title = row.get('names', '').strip()
                year = None
                
                # Try to extract year from date_x column
                try:
                    date_str = row.get('date_x', '')
                    if date_str:
                        year = int(date_str.split('/')[-1])
                except:
                    pass
                
                logger.info(f"Processing {i+1}: {title}")
                
                # Search for poster
                movie_data = await fetcher.search_movie(title, year)
                poster_url = ""
                
                if movie_data and movie_data.get("poster_path"):
                    poster_url = fetcher.get_poster_url(movie_data["poster_path"])
                    logger.info(f"Found poster: {poster_url}")
                else:
                    logger.warning(f"No poster found for {title}")
                
                row['poster_url'] = poster_url
                writer.writerow(row)
                
                # Rate limiting
                await asyncio.sleep(0.25)
    
    logger.info(f"Updated CSV saved to {output_path}")

if __name__ == "__main__":
    # Choose which method to use:
    # Option 1: Update database directly
    asyncio.run(update_movie_posters())
    
    # Option 2: Create new CSV with poster URLs
    #asyncio.run(update_csv_with_posters()) 