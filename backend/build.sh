#!/usr/bin/env bash
# Exit on error
set -o errexit

# Start the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port $PORT 