# src/core — App-wide infrastructure

Lint element: `core` (except `core/di`, which has its own file). Owning rules: skill `bp-architecture`.

- HTTP client, `api-endpoints.ts`, error normalizer (`to-app-error.ts`), auth/session, interceptors, observability.
- May import `kernel`, `shared/lib`, `core`. Never imports features.
- The UI error message map is **not** here — presentation cannot import `core`; it lives in `src/shared/lib`.
- No business rules. Feature-specific constants (e.g. business error codes) live in the feature; `core` only translates them through the normalizer.
- New endpoint → add it to `api-endpoints.ts` grouped by feature (`bp-api-integration`).
