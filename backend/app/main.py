from fastapi import FastAPI
from .api import movies, swipes

app = FastAPI(title="Swimo API", version="0.0.1")
app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(swipes.router, prefix="/swipes", tags=["swipes"])