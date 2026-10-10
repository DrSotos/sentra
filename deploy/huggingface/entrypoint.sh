#!/bin/bash
set -e

echo "=== Starting SENTRA on Hugging Face Spaces ==="

# Check if external DATABASE_URL is provided, otherwise start internal PostgreSQL
if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"@db:"* ]]; then
    echo "[SENTRA] Initializing and starting local PostgreSQL service..."
    sudo service postgresql start
    
    # Configure user and database
    sudo -u postgres psql -c "CREATE USER sentra WITH PASSWORD 'sentra_secret';" || true
    sudo -u postgres psql -c "CREATE DATABASE sentra OWNER sentra;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sentra TO sentra;" || true
    
    export DATABASE_URL="postgresql+asyncpg://sentra:sentra_secret@127.0.0.1:5432/sentra"
    echo "[SENTRA] Local PostgreSQL is online."
else
    echo "[SENTRA] Using external DATABASE_URL."
fi

# Ensure port 7860 is used for Hugging Face Spaces
export PORT=7860
echo "[SENTRA] Starting FastAPI Uvicorn on 0.0.0.0:7860..."
exec uvicorn app.main:app --host 0.0.0.0 --port 7860

