from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def record_swipe(movie_id: int, direction: str):
    # TODO persist later
    return {"movie_id": movie_id, "direction": f"YOU SWIPED {direction}"}