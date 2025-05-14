from ..app.models import Movie
from ..app.db import engine, Session
from sqlalchemy import text

SEED_MOVIES = [
    {"title": "The Shawshank Redemption", "year": 1994},
    {"title": "The Godfather", "year": 1972},
    {"title": "The Dark Knight", "year": 2008},
    {"title": "Pulp Fiction", "year": 1994},
    {"title": "Forrest Gump", "year": 1994},
    {"title": "Inception", "year": 2010},
    {"title": "Fight Club", "year": 1999},
    {"title": "The Matrix", "year": 1999},
    {"title": "The Lord of the Rings: The Fellowship of the Ring", "year": 2001},
    {"title": "The Lord of the Rings: The Two Towers", "year": 2002},
    {"title": "The Lord of the Rings: The Return of the King", "year": 2003},
    {"title": "Interstellar", "year": 2014},
    {"title": "The Silence of the Lambs", "year": 1991},
    {"title": "Se7en", "year": 1995},
    {"title": "Gladiator", "year": 2000},
    {"title": "The Prestige", "year": 2006},
    {"title": "The Departed", "year": 2006},
    {"title": "Whiplash", "year": 2014},
    {"title": "The Lion King", "year": 1994},
    {"title": "Titanic", "year": 1997},
]


def run():
    with Session(engine) as sess:
        if sess.exec(text("SELECT 1 FROM movie LIMIT 1")).first():
            print("Movies already seeded"); return
        for m in SEED_MOVIES:
            sess.add(Movie(**m))
        sess.commit()
        print(f"Seeded {len(SEED_MOVIES)} movies.")

if __name__ == "__main__":
    run()
