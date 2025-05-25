from fastapi import APIRouter
from .movies import router as movies_router
from .swipes import router as swipes_router

router = APIRouter()

router.include_router(movies_router, prefix="/movies", tags=["movies"])
router.include_router(swipes_router, prefix="/swipes", tags=["swipes"])
