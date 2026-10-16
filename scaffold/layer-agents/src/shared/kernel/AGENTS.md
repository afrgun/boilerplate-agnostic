# src/shared/kernel — Kernel

Lint element: `kernel`. Owning rules: skill `bp-architecture`.

- Holds only `Result<T, E>` (`ok`, `err`), `AppError`, and the presentation-side `unwrap` helper where the stack uses it.
- Imports nothing outside this folder. No framework, no I/O, no async.
- Changes here affect every feature — keep the API tiny and stable; add tests for every helper.
- Max file size: see `bp-conventions` (domain row).
