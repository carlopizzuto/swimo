import pandas as pd
import pickle
import base64
from pathlib import Path
import sys
from datetime import datetime
from sqlalchemy import text

# Add the parent directory to sys.path to allow imports from app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db import engine, Session
from app.models import Movie
from app.recommender import MovieEmbedding

DATA_DIR = Path(__file__).parent.parent / "data"
EMBEDDINGS_DIR = Path(__file__).parent.parent / "recommender" / "data"
KAGGLE_DATASET_PATH = DATA_DIR / "imdb_movies.csv"
EMBEDDINGS_PATH = EMBEDDINGS_DIR / "movie_embeddings.pkl"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
EMBEDDINGS_DIR.mkdir(exist_ok=True, parents=True)

def load_kaggle_dataset():
    """Load the Kaggle dataset."""
    if not KAGGLE_DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {KAGGLE_DATASET_PATH}. Please run fetch_kaggle_ds.py first.")
    
    print(f"Loading dataset from {KAGGLE_DATASET_PATH}")
    return pd.read_csv(KAGGLE_DATASET_PATH)

def extract_year(date_str):
    """Extract year from a date string."""
    if pd.isna(date_str):
        return None
    try:
        return int(date_str.strip().split('/')[-1])
    except:
        return None

def clean_dataset(df):
    """Clean and prepare the dataset."""
    # Make a copy to avoid modifying the original
    df = df.copy()
    
    # Extract year from date_x
    df['year'] = df['date_x'].apply(extract_year)
    
    # Fill NaN values
    df['overview'] = df['overview'].fillna('')
    df['genre'] = df['genre'].fillna('')
    
    # Remove rows with no title or overview
    df = df[df['names'].notna() & (df['names'] != '')]
    
    # Rename columns to match our model
    df = df.rename(columns={'names': 'title'})
    
    return df

def generate_and_save_embeddings(df, batch_size=32):
    """Generate embeddings for the movies and save them to a file."""
    print("Initializing embedding model...")
    embedding_model = MovieEmbedding()
    
    print(f"Generating embeddings for {len(df)} movies (this may take a while)...")
    movies_dict = df.to_dict('records')
    embeddings = embedding_model.generate_embeddings_batch(movies_dict, batch_size)
    
    # Convert numpy arrays to list for easier serialization
    embeddings_list = [emb.tolist() for emb in embeddings]
    
    # Prepare data for saving
    data_to_save = {
        'embeddings': embeddings_list,
        'movies': movies_dict,
        'movie_ids': list(range(1, len(df) + 1))  # Assuming IDs start from 1
    }
    
    # Save embeddings to file
    print(f"Saving embeddings to {EMBEDDINGS_PATH}")
    with open(EMBEDDINGS_PATH, 'wb') as f:
        pickle.dump(data_to_save, f)
    
    return embeddings_list

def seed_database(df, embeddings):
    """Seed the database with movies and their embeddings."""
    print("Seeding database...")
    
    with Session(engine) as session:
        # Check if movies already exist
        if session.exec(text("SELECT 1 FROM movie LIMIT 1")).first():
            print("Movies already seeded in database. Skipping.")
            return
        
        # Prepare movies for database
        for i, (_, row) in enumerate(df.iterrows()):
            # Convert embedding to a base64 encoded string
            embedding_bytes = pickle.dumps(embeddings[i])
            embedding_str = base64.b64encode(embedding_bytes).decode('utf-8')
            
            # Create movie object
            movie = Movie(
                title=row['title'],
                year=row['year'],
                genres=row['genre'],
                overview=row['overview'],
                score=row['score'],
                embedding_vector=embedding_str
            )
            
            session.add(movie)
        
        # Commit all changes
        session.commit()
        print(f"Seeded {len(df)} movies in database.")

def run():
    """Main function to run the script."""
    print(f"Starting database seeding process at {datetime.now()}")
    
    # Load and clean dataset
    df = load_kaggle_dataset()
    df = clean_dataset(df)
    
    # Limit to a smaller set (for testing)
    df = df[df['score'] > 75].head(100)
    
    # Generate embeddings
    embeddings = None
    if EMBEDDINGS_PATH.exists():
        print(f"Loading existing embeddings from {EMBEDDINGS_PATH}")
        with open(EMBEDDINGS_PATH, 'rb') as f:
            data = pickle.load(f)
            embeddings = data['embeddings']
    else:
        embeddings = generate_and_save_embeddings(df)
    
    # Seed database
    seed_database(df, embeddings)
    
    print(f"Database seeding completed at {datetime.now()}")

if __name__ == "__main__":
    run()
