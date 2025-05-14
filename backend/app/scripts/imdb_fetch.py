import kagglehub
from kagglehub import KaggleDatasetAdapter
import os

# Set the path to the file you'd like to load
file_path = "imdb_movies.csv"

# Load the latest version
df = kagglehub.dataset_load(
  KaggleDatasetAdapter.PANDAS,
  "ashpalsingh1525/imdb-movies-dataset",
  file_path,
)

print("Dataset loaded successfully\nExporting to CSV...")

df.to_csv(os.path.join(os.path.dirname(__file__), "../data/imdb_movies.csv"), index=False)