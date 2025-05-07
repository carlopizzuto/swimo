from typing import Optional
from sqlmodel import SQLModel, Field

class Movie(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    poster_url: str | None = None
    year: int | None = None
    genres: str | None = None   

class Swipe(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int                # temp hard‑coded to 1
    movie_id: int
    direction: bool             # True = like, False = dislike
    ts: str | None = None       # ISO timestamp; autogenerate later
