# backend/Dockerfile

# --- STAGE 1: Builder ---
FROM python:3.13.11-slim AS builder
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

# Instalar uv (versión específica para determinismo)
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /bin/uv

# Copiar archivos de dependencias
COPY pyproject.toml uv.lock ./
COPY backend/pyproject.toml ./backend/

# --- SOLUCIÓN DE RAÍZ Y OPTIMIZADA ---
# En lugar de 'uv sync' (que usa instalaciones editables problemáticas en Docker),
# exportamos las dependencias exactas del lock a un formato plano.
# Esto asegura que FastAPI y Uvicorn se instalen como paquetes reales.
RUN uv export --frozen --no-dev --package app-backend --format requirements-txt --output-file requirements.txt

# Creamos el venv e instalamos desde la lista generada.
# MANTENEMOS TU OPTIMIZACIÓN: --compile-bytecode para generar los .pyc ahora.
RUN uv venv /app/.venv && \
    uv pip install -r requirements.txt --python /app/.venv --compile-bytecode

# Copiar solo el código necesario (Ya no necesitamos instalarlo, solo copiarlo)
COPY backend ./backend

# (Nota: Eliminamos el segundo 'uv sync' y el 'uv pip install' manual porque
#  el paso de exportación de arriba YA incluyó todo lo necesario automáticamente).

# --- STAGE 2: Runtime ---
FROM python:3.13.11-slim

# CAMBIO AQUÍ: Añadimos /app/backend al PYTHONPATH
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/backend"

WORKDIR /app

# Crear usuario sin privilegios (Seguridad)
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copiar el entorno virtual COMPLETO (incluyendo binarios y bytecode ya compilado)
COPY --from=builder /app/.venv /app/.venv
# Copiar el código fuente
COPY --from=builder /app/backend /app/backend

# Asignar permisos
RUN chown -R appuser:appuser /app

USER appuser

# EJECUCIÓN PURA:
# Llamamos directamente a uvicorn desde el venv.
# Gracias al PYTHONPATH="/app", Python encontrará tu código en /app/backend sin necesidad de instalación editable.
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]