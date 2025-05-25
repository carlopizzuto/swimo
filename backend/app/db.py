from sqlmodel import SQLModel, create_engine, Session
import os

DB_URI = os.getenv("DATABASE_URL")
PROD_DB_URI = os.getenv("PROD_DATABASE_URL")

engine = create_engine(DB_URI, echo=False)

prod_engine = create_engine(PROD_DB_URI, echo=False)

def get_session():
    with Session(engine) as session:
        yield session

def get_prod_session():
    with Session(prod_engine) as session:
        yield session