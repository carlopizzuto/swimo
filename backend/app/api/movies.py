from fastapi import APIRouter
import random

router = APIRouter()

DUMMY_MOVIES = [
    {"id": 1, "title": "Inception", "poster": "/static/inception.jpg"},
    {"id": 2, "title": "The Matrix", "poster": "/static/matrix.jpg"},
    {"id": 3, "title": "Interstellar", "poster": "/static/interstellar.jpg"},
]

@router.get("/random")
async def random_movie():
    return random.choice(DUMMY_MOVIES)
