set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]
default: verify

# --- Setup ---
setup:
  pnpm install
  # NOTE: use --extra dev because backend tools are optional-deps under extra "dev".
  uv sync --directory backend --extra dev

# --- Frontend ---
frontend-dev:
  pnpm --dir frontend dev

lint:
  pnpm --dir frontend lint

format:
  pnpm --dir frontend format

type:
  pnpm --dir frontend type-check

test:
  pnpm --dir frontend test

build:
  pnpm --dir frontend build

scan:
  pnpm audit --prod

orval:
  pnpm --dir frontend orval

frontend-verify:
  just format
  just lint
  just type
  just test
  just build
  just scan

# --- Backend ---
dev: 
  $env:DATABASE_URL="sqlite+aiosqlite:///./dev.db"; uv run --directory backend python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

backend-lint:
  uv run --directory backend ruff format --check .
  uv run --directory backend ruff check .

backend-type:
  uv run --directory backend mypy app

backend-test:
  uv run --directory backend pytest

backend-scan:
  cd backend
  uvx pip-audit

backend-verify:
  just backend-lint
  just backend-type
  just backend-test
  just backend-scan

# --- Backend SQLite (local) ---
backend-reset-sqlite:
  if (Test-Path backend/dev.db) { Remove-Item -Force backend/dev.db }
  $env:DATABASE_URL="sqlite+aiosqlite:///./dev.db"; uv run --directory backend python scripts/init_sqlite.py

backend-migrate-sqlite:
  $env:DATABASE_URL="sqlite+aiosqlite:///./dev.db"; uv run --directory backend python -m alembic upgrade head

# --- Docker ---
docker-up:
  docker compose up

docker-up-b:
  docker compose up --build --no-cache

docker-down:
  docker compose down -v --remove-orphans

docker-delete:
  @echo "PHASE 1: Stop and annihilate containers"
  -docker compose down -v --remove-orphans
  # Pasa el array directo (más rápido que ForEach). El '-' al inicio ignora error si no hay nada que borrar.
  -docker rm -f $(docker ps -aq)
  @echo "PHASE 2: Prune System (Images, Networks, Volumes)"    docker system prune -a --volumes -f
  @echo "PHASE 3: Prune Build Cache"
  docker builder prune -a -f
  @echo "✅ Docker is completely clean."

# --- GitHub: Nuclear Reset ---
gh url:
  Remove-Item -Recurse -Force .git
  git init
  git add .
  git commit -m "Initial Commit"
  git remote add origin {{url}}
  git push -u --force origin main

verify:
  just backend-verify
  just frontend-verify

versions:
  git --version
  uv tool list
  uv --version
  docker --version
