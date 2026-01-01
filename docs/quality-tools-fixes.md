# Quality Tools Fixes

## Entradas
- ESLint error in frontend/src/api/http-client.ts (no-unsafe-return).
- Prettier check warnings on generated/build artifacts and source files.

## Salidas
- Lint passes with safe string handling for env vars.
- Prettier check passes with ignores for generated/build outputs and formatted sources.

## Supuestos
- Generated outputs should not be formatted by Prettier.
- Formatting source files is acceptable.

## Precondiciones
- Prettier is available in frontend dependencies.

## Postcondiciones
- pnpm --dir frontend lint passes.
- pnpm --dir frontend format passes.

## Invariantes
- No behavior change beyond safe env parsing.
- No manual edits to generated API outputs.

## Casos borde
- PUBLIC_API_URL is non-string or empty.
- Build artifacts exist in repo.
