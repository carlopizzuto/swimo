from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from sqlmodel import Session

from ..db import get_session

router = APIRouter()

@router.get("/database-status")
async def get_database_status(session: Session = Depends(get_session)):
    """Check the current status of the database."""
    try:
        movie_count = session.exec(text("SELECT COUNT(*) as count FROM movie")).first()
        swipe_count = session.exec(text("SELECT COUNT(*) as count FROM swipe")).first()
        return {
            "is_seeded": movie_count.count > 0 if movie_count else False,
            "movie_count": movie_count.count if movie_count else 0,
            "swipe_count": swipe_count.count if swipe_count else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check failed: {str(e)}") 