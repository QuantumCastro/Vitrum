# ADR-0001: Stack hibrido con Astro + FastAPI + PostgreSQL + Nginx

- **Fecha:** 2025-11-25
- **Estatus:** Aceptado

## Contexto
- Se requiere un stack que combine entrega estatica/SSR rapida (SEO) con APIs tipadas y DB relacional.
- Se busca DX alta: hot reload, contratos OpenAPI -> clientes TS automaticos, linting en ambos lados.
- Debe ser reproducible en contenedores y sencillo de desplegar en un gateway unico.

## Decision
- Usar Astro como framework frontend (SSG/SSR) con islands React para interactividad.
- Empaquetar un backend FastAPI async con SQLModel y Alembic para migraciones, gestionado por uv.
- Base de datos PostgreSQL como store principal.
- Orquestar con Docker Compose y un Nginx como reverse proxy / API gateway ( `/api/*` -> FastAPI, resto -> Astro).
- Generar clientes y hooks desde `openapi.json` con Orval + TanStack Query.
- Ruff para lint/format del backend; ESLint/Prettier para frontend.

## Consecuencias
- Positivas: contrato tipado extremo a extremo; entornos dev/paridad prod con compose; separacion clara gateway/frontend/backend.
- Negativas: mas contenedores implican mayor huella local; requiere mantener lockfiles (pnpm/uv) y regenerar clientes al cambiar el backend.

## Alternativas Consideradas
- Next.js fullstack: descartado por requerir serverless/Edge y por menor control sobre API gateway/Nginx.
- Django/DRF: descartado por velocidad de iteracion y menor afinidad con async/React Query.
- SQLite/NoSQL: descartado por necesidad de concurrencia y tipos robustos.

## Notas de Seguimiento
- Definir pipelines CI: lint/type/test/build para frontend y lint/test/migrate-check para backend.
- Evaluar despliegue: Vercel para frontend + FastAPI en contenedor (Fly/Render) o todo en Kubernetes con Nginx Ingress.
