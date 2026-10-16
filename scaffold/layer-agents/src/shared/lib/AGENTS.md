# src/shared/lib — Shared pure helpers

Lint element: `shared-lib`. Owning rules: skills `bp-architecture`, `bp-ui-components` (rule on `formatOrDash`).

- Pure, framework-free, I/O-free functions used by 2+ features: formatters (`formatOrDash`, currency, dates), the UI error message map (`toUiError` by `AppError.type`), small validators, collection helpers.
- May import only `kernel` and `shared/lib`.
- A helper used by one feature stays in that feature's `domain/` until a second consumer appears.
- No business rules of a specific feature here — those belong in the feature's `domain/`.
- Every helper has unit tests.
