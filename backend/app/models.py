from typing import Optional, List
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str

class Movie(SQLModel, table=True):
    __tablename__ = "movies"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    poster_url: Optional[str] = None
    year: Optional[int] = None
    genres: Optional[str] = None
    overview: Optional[str] = None
    score: Optional[float] = None
    embedding_vector: Optional[str] = None  # as pickled and base64-encoded string

class Swipe(SQLModel, table=True):
    __tablename__ = "swipes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int                
    movie_id: int
    direction: bool             # True = like, False = dislike
    ts: Optional[str] = None       # ISO timestamp; autogenerate later
