from typing import Optional, List
from sqlmodel import SQLModel, Field

class Movie(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    poster_url: Optional[str] = None
    year: Optional[int] = None
    genres: Optional[str] = None
    overview: Optional[str] = None
    score: Optional[float] = None
    embedding_vector: Optional[str] = None  # as pickled and base64-encoded string

class Swipe(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int                
    movie_id: int
    direction: bool             # True = like, False = dislike
    ts: Optional[str] = None       # ISO timestamp; autogenerate later
