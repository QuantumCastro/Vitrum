# frontend/Dockerfile

# --- STAGE 1: Base & Dependencies ---
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /workspace

# Copiar definiciones del monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json

# INSTALACIÓN CON CACHÉ (La joya de la corona):
# --mount=type=cache: Docker guarda el store de pnpm en un volumen host.
# Si borras el contenedor y reconstruyes, NO vuelve a descargar internet.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

# --- STAGE 2: Build ---
FROM base AS builder
COPY frontend ./frontend
# Build del frontend
RUN pnpm --dir frontend build

# --- STAGE 3: Production (Nginx) ---
FROM nginx:1.27-alpine AS production

# Seguridad: Ejecutar Nginx como usuario no-root (nginx user ya existe en alpine)
# Nota: Nginx en puerto 80 requiere root, pero podemos usar puerto alto si la seguridad es extrema.
# Por compatibilidad estándar, mantenemos root para el bind del puerto 80, 
# pero Nginx hace drop privileges a 'nginx' en los workers automáticamente.

# Copiar build de Astro
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html

# Copiar configuración optimizada (gzip, cache policies)
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
