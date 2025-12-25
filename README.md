# Vitrum - Notas y grafo full-stack

App Astro/React + FastAPI/SQLModel con login/registro, vaults y notas persistentes estilo Obsidian. El grafo se genera en cliente a partir de las notas cargadas.

## Requisitos
- Node 24+ y pnpm 10+
- Python 3.13+ con `uv`
- Docker + Docker Compose (stack completo opcional)

## Setup rapido
```bash
just setup
```
Variables (usa los `.env.example`):
- Frontend: `PUBLIC_API_BASE_URL` (opcional). En **dev** cae a `http://localhost:8000`; en **Docker+NGINX** usa same-origin automáticamente. Importante: NO incluir `/api` (las rutas del OpenAPI ya lo traen).
- Backend: `DATABASE_URL` (Postgres por defecto; en dev puedes usar SQLite con `sqlite+aiosqlite:///./dev.db`), `ALLOW_ORIGINS`, `AUTH_SECRET_KEY`, `AUTH_TOKEN_TTL_MINUTES`, `API_PREFIX`

## Comandos utiles
- Frontend: `pnpm --dir frontend dev|build|lint|type-check|test|orval`
- Backend (Postgres por defecto): `uv run --directory backend uvicorn app.main:app --reload`, `uv run --directory backend ruff check .`, `uv run --directory backend pytest`
- Backend (SQLite dev): `just backend-api-sqlite` (levanta uvicorn con `backend/dev.db`), `just backend-reset-sqlite` (borra/recrea), `just backend-migrate-sqlite` (alembic con SQLite)
- Compose: `docker compose up --build`, `docker compose down -v`
- Pipeline integrado: `just verify`

## API y cliente TS
- OpenAPI disponible en `/api/openapi.json` (servida por FastAPI). Para regenerar el archivo local usado por Orval:  
  `uv run --directory backend python -c "import json; from app.main import app; json.dump(app.openapi(), open('backend/openapi.json','w',encoding='utf-8'))"`
- Generar hooks React Query: `pnpm --dir frontend orval` (lee `backend/openapi.json`).

## Estructura
- `frontend/`: Astro 5 + React + Tailwind. Island principal en `src/components/NeuralNotesApp.tsx` (login, editor, grafo, vaults). `PUBLIC_API_BASE_URL` configura el gateway.
- `backend/`: FastAPI async + SQLModel. Modelos `User`, `Vault`, `Note` con auth JWT. Rutas `/api/auth/*` y `/api/vaults/*`. OpenAPI configurado en `/api/openapi.json`.
- `docs/`: ADRs, arquitectura y worklogs de la iteracion.

## Flujo funcional
1) Registro/Login (`/api/auth/register|login`) -> token JWT almacenado en `localStorage`.
2) Listar/crear vaults (`/api/vaults`) y notas (`/api/vaults/{id}/notes`). Los links se validan dentro del mismo vault.
3) UI reactiva con React Query + Axios (mutator en `src/api/http-client.ts`).

## Troubleshooting
- CORS: ajusta `ALLOW_ORIGINS` y el gateway (nginx) si usas otro host.
- Tokens invalidos: el cliente limpia `localStorage` si recibe 401 y muestra el overlay de login.
- Orval falla: asegurate de regenerar `backend/openapi.json` y que la ruta sea accesible.
