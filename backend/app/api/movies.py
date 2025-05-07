from fastapi import APIRouter, Depends
from sqlmodel import select
from random import choice
from ..db import get_session
from ..models import Movie, Swipe

router = APIRouter()

@router.get("/random/", response_model=Movie)
@router.get("/random", response_model=Movie)
def random_movie(session=Depends(get_session)):
    ids = session.exec(select(Movie.id)).all()
    movie = session.get(Movie, choice(ids))
    return movie
