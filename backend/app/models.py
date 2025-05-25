from typing import Optional, List
from sqlmodel import SQLModel, Field
import pickle
import json

class Movie(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    poster_url: str | None = None
    year: int | None = None
    genres: str | None = None
    overview: str | None = None
    score: float | None = None
    embedding_vector: str | None = None  # Store as pickled and base64 encoded string

class Swipe(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int                # temp hard‑coded to 1
    movie_id: int
    direction: bool             # True = like, False = dislike
    ts: str | None = None       # ISO timestamp; autogenerate later
