# Backend Quality Fixes

## Entradas
- Ruff format check failures in auth/vaults endpoints.
- Mypy type errors in security, deps, vaults, auth, main.

## Salidas
- Ruff format passes for backend.
- Mypy passes for backend.

## Supuestos
- SQLModel models map to Pydantic schemas with from_attributes enabled.
- Auth token hashing uses passlib bcrypt.

## Precondiciones
- Backend dependencies installed via uv/venv.

## Postcondiciones
- Type annotations are explicit and accurate.
- Responses return Pydantic schemas where declared.

## Invariantes
- No DB access added to health endpoint.
- Existing API behavior preserved.

## Casos borde
- Missing auth token or invalid JWT.
- Vaults with zero notes.
