# src/core — App-wide infrastructure

Lint element: `core` (except `core/di`, which has its own file). Owning rules: skill `bp-architecture`.

- HTTP client, `api-endpoints.ts`, error normalizer (`to-app-error.ts`), error message map, auth/session, interceptors, observability.
- May import `kernel`, `shared/lib`, `core`. Never imports features.
- No business rules. Feature-specific constants (e.g. business error codes) live in the feature; `core` only translates them through the normalizer.
- New endpoint → add it to `api-endpoints.ts` grouped by feature (`bp-api-integration`).
