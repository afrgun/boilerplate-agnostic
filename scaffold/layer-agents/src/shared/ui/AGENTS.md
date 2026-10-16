# src/shared/ui — Shared UI atoms & molecules

Lint element: `shared-ui`. Owning rules: skill `bp-ui-components`.

- Atoms and molecules (and organisms only when used by 2+ features). No data fetching, no stores, no business rules, no feature imports.
- May import `kernel`, `shared/lib`, `shared/ui`.
- Extend an atom with a variant/prop instead of forking it. New atom → also add it to `stack-profile.md` § Shared UI atoms available.
- Every interactive atom: keyboard reachable, accessible name, focus/disabled/error states.
