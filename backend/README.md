# Backend de notas/grafo (FastAPI + SQLModel)

Backend con autenticación JWT, bóvedas y notas persistentes. Expone OpenAPI en `/api/openapi.json`.

## Uso rápido
- Arranque dev: `uv run --directory backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- Linter: `uv run --directory backend ruff check .`
- Formato: `uv run --directory backend ruff format .`
- Migraciones (si el owner las quiere generar): `uv run --directory backend alembic revision --autogenerate -m "..."` y `uv run --directory backend alembic upgrade head`

## Endpoints principales
- `POST /api/auth/register` — alta de usuario (email + password). Devuelve token + usuario.
- `POST /api/auth/login` — login. Devuelve token + usuario.
- `GET /api/auth/me` — perfil autenticado.
- `GET/POST/PATCH /api/vaults` — listar/crear/actualizar bóvedas del usuario.
- `GET /api/vaults/{vault_id}` — detalle + notas.
- `GET/POST/PATCH/DELETE /api/vaults/{vault_id}/notes` — CRUD de notas (links saneados al mismo vault).

## Variables de entorno
- `DATABASE_URL` (ej. `postgresql+asyncpg://app:app@db:5432/app`)
- `ALLOW_ORIGINS` (CSV de orígenes para CORS)
- `AUTH_SECRET_KEY` (clave JWT, cambia el valor de ejemplo)
- `AUTH_TOKEN_TTL_MINUTES` (TTL del token, default 720)
- `API_PREFIX` (default `/api`)

## Notas
- `init_db` crea las tablas a partir de los modelos SQLModel al iniciar la app (útil en dev/preview).
- Modelo listo para `alembic revision --autogenerate` sin aplicarlo desde Codex.
- OpenAPI sirve para regenerar clientes con Orval en el frontend.
