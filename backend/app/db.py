from sqlmodel import SQLModel, create_engine, Session
import os

DB_URI = os.getenv("DATABASE_URL")
engine = create_engine(DB_URI, echo=False)

def get_session():
    with Session(engine) as session:
        yield session
