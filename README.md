# SWIMO
### **tinder for movies**

Ever feel like there are no good movies to watch? Always finish your food before choosing a movie?

Swimo is your new best friend.

## Run

**Prerequisites**

* [Docker](https://docs.docker.com/get-docker/) installed and running.

```bash
# Run from the repository root
docker compose build   # Build the backend & frontend images
docker compose up      # Start the containers
```

Once the containers are up and running, open your browser at [http://localhost:3000](http://localhost:3000) to start swiping 🎬.

## Architecture

```
[PostgreSQL] ←→ [FastAPI backend :8000] ←→ [Next.js frontend :3000]
```

* **PostgreSQL** ‑ persists users, movies, swipe history and movie embeddings
* **FastAPI** ‑ REST API, recommendation engine and background scripts
* **Next.js** ‑ React UI served with hot-reload in development
* **Docker Compose** stitches everything together via the `swimo-net` network.

### Ports
* 3000 – Frontend
* 8000 – Backend API
* 5432 – Postgres (optional, for local DB tools)

## How the recommendation system works

1. The script `backend/app/scripts/seed_db.py` downloads a subset of the IMDb dataset (via Kaggle) and cleans it.
2. Each movie is embedded into a 384-dimensional vector using the Sentence-Transformers model **all-MiniLM-L6-v2** (`backend/app/recommender/embeddings.py`).
3. The vector is pickled, base-64 encoded and stored alongside the movie in the database.
4. At runtime, `MovieRecommender` lazily loads all embeddings into memory.
5. For a given user it computes a "user profile" vector = mean(liked) − mean(disliked) and performs cosine similarity against all unseen movies (`backend/app/recommender/recommender.py`).
6. The top-N most similar movies are returned; if the user has no likes yet, SWIMO falls back to random unseen picks.

This **content-based** approach is fast and works out-of-the-box, while leaving room for future collaborative or hybrid methods.

## API quick reference

Endpoint | Method | Description
--- | --- | ---
`/api/movies/random` | GET | Fetch a random movie
`/api/movies/recommend?user_id=1&top_n=5` | GET | Get top-N recommendations for a user
`/api/swipes` | POST | Record a swipe `{ user_id, movie_id, direction }`
`/api/swipes/{user_id}/history` | GET | Full swipe history with movie details

Backend docs (Swagger/OpenAPI) are auto-generated at `http://localhost:8000/docs` when the server is running.

## Development

```bash
# Backend (outside Docker)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (outside Docker)
cd frontend
npm install
npm run dev
```
Hot-reload is enabled on both sides. The frontend expects `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

## Environment variables

Create a `.env` file in the project root (or copy `.env.example`) and fill in the following values:

| Variable | Purpose | Example / Default |
|----------|---------|-------------------|
| POSTGRES_DB | Postgres database name (Docker compose) | swimo_db |
| POSTGRES_USER | Postgres username | swimo_user |
| POSTGRES_PASSWORD | Postgres password | swimo_pass |
| DATABASE_URL | SQLAlchemy URL used by the backend | postgresql://postgres:postgres@db:5432/swimo_db |
| PROD_DATABASE_URL | Optional production DB URL (overrides DATABASE_URL) |  |
| SECRET_KEY | JWT signing key for access tokens | change_me |
| TMDB_API_KEY | The Movie Database API key used by the seed script to fetch posters |  |
| NEXT_PUBLIC_API_URL | Base URL of the backend API for the Next.js app | http://localhost:8000 |

## Roadmap

- [x] Docker-compose environment (Postgres + FastAPI + Next.js)
- [x] Proof-of-concept content-based recommender
- [x] Basic swipe UI & routing
- [ ] User authentication & secure sessions
- [ ] Collaborative filtering upgrade (matrix factorisation / embeddings)
- [ ] Search & advanced filters (genre, year, score)
- [ ] Responsive / mobile-first design polish
- [ ] CI/CD pipeline & cloud deployment

Contributions and suggestions are welcome – feel free to open an issue or a PR 🚀