from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from .api import movies, swipes, admin, users
from .db import engine

app = FastAPI(title="Swimo API", version="0.0.2")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies.router, prefix="/movies", tags=["movies"])
app.include_router(swipes.router, prefix="/swipes", tags=["swipes"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(users.router, prefix="/users", tags=["users"])

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.on_event("shutdown")
def on_shutdown():
    engine.dispose()