from __future__ import annotations

from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from typing import Any, cast

import bcrypt
import jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext

from app.core.config import settings

# Parche para compatibilidad: algunas versiones de bcrypt no exponen __about__,
# lo que rompe passlib. Normalizamos aquí.
bcrypt_module = cast(Any, bcrypt)
if not hasattr(bcrypt_module, "__about__"):
    bcrypt_module.__about__ = SimpleNamespace(__version__=getattr(bcrypt_module, "__version__", ""))
bcrypt_backend = getattr(bcrypt_module, "_bcrypt", None)
if bcrypt_backend is not None and not hasattr(bcrypt_backend, "__about__"):
    bcrypt_backend.__about__ = bcrypt_module.__about__

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bool(pwd_context.verify(plain_password, hashed_password))


def get_password_hash(password: str) -> str:
    try:
        return str(pwd_context.hash(password))
    except ValueError as exc:
        # bcrypt errors (e.g., len >72 bytes) se devuelven como 400
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña inválida para bcrypt (máx 72 bytes).",
        ) from exc


def create_access_token(subject: str) -> str:
    expire_minutes = settings.auth_token_ttl_minutes
    expire = datetime.now(UTC) + timedelta(minutes=expire_minutes)
    payload = {"sub": subject, "exp": expire}
    try:
        return jwt.encode(payload, settings.auth_secret_key, algorithm=settings.auth_algorithm)
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo generar el token de acceso",
        ) from exc
