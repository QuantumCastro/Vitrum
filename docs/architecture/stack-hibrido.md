# Arquitectura hibrida: Astro + Nginx + FastAPI + PostgreSQL 

- **Gateway**: Nginx enruta `/api/*` al backend FastAPI y el resto al frontend Astro. Unifica dominio y CORS.
- **Frontend**: Astro SSG/SSR con islands React. Estilos con Tailwind. Datos asincrónicos vía TanStack Query; clientes opcionales generados por Orval desde el `openapi.json` del backend.
- **Backend**: FastAPI (async) gestionado con uv. Modelado futuro con SQLModel. Migraciones con Alembic. Lint/format con Ruff.
- **Data**: PostgreSQL como almacenamiento principal. Alembic usará el metadata de SQLModel para autogenerar migraciones.
- **Contenedores**: `docker-compose.yml` levanta `frontend`, `backend`, `db` y `nginx` (reverse proxy).

## Flujos clave
- **Desarrollo local**: `docker compose up --build` -> http://localhost:8080 con Nginx frente a Astro dev server y FastAPI (8000) + Postgres (5432).
- **Contrato tipado**: cuando haya API, `pnpm --dir frontend orval` generará clientes TS + hooks React Query en `src/lib/api/generated/` a partir de `/api/openapi.json`.
- **Estado async**: usar un `QueryClient` compartido por island que consuma API. Configurar `PUBLIC_API_BASE_URL` hacia el gateway.
- **Migraciones**: `uv run alembic revision --autogenerate -m "..."` y `uv run alembic upgrade head`. La conexión usa `DATABASE_URL` (asyncpg o bien SQLite en dev).

## Variables relevantes
- Frontend: `PUBLIC_API_BASE_URL` (ej. `http://localhost:8080/api`).
- Backend: `DATABASE_URL`, `ALLOW_ORIGINS`, `app_name`.
- DB: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (docker-compose).

## Consideraciones
- Mantener lockfiles (`uv.lock`, `pnpm-lock.yaml`) para reproducibilidad.
- No exponer secretos en frontend; solo variables `PUBLIC_*` deben llegar al cliente.
- Las islas React deben hidratar solo lo necesario; preferir Astro para contenido estático.
