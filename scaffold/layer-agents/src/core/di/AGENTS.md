# src/core/di — DI accessors

Lint element: `di`. Owning rules: skill `bp-architecture` (rule 9), `references/<stack>.md` § 8.

- Factories/accessors that build ports from adapters (e.g. `createPorts`, `createServerPorts`) and expose them to presentation (e.g. a provider + accessor hook).
- One of only two places allowed to name adapters (the other is `app`). Presentation may import from here; it must never import adapters directly.
- Server-side factories create instances per request — never a module-level singleton holding user data.
- No business rules, no UI beyond the provider.
