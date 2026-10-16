# src/features — Feature slices

Owning rules: skill `bp-architecture` (layers, slicing), `bp-feature-lifecycle` (order of work). Full templates: `references/<stack>.md` § 4–10.

Each feature is `src/features/<feature>/` with these layers. **A feature never imports another feature** — shared types/rules move to `src/shared/`.

| Folder | Lint element | Holds | Must not |
|---|---|---|---|
| `domain/` | `domain` | Plain types, value objects, pure business rules (`selectableBanks`, `validateAmount`) | Import framework/HTTP/storage; be async; mirror raw API fields |
| `application/` | `application` | Ports (contracts returning `Result`), use cases **only when they hold logic** | Import infrastructure, presentation, UI/HTTP libraries |
| `infrastructure/` | `infrastructure` | Adapters, mappers (`toX`), raw API types, mock adapters | Import presentation; let raw API types leave this folder; throw to callers |
| `presentation/` | `presentation` | Store/state hooks, components, templates, pages | Import infrastructure or HTTP clients; hold business rules; render raw values without `formatOrDash` |
| `<feature>.routes.ts` (stacks that use it) | `app` | Feature route + providers | Be imported by the feature's layers |

Before finishing work in a feature: lint boundaries pass, mapper/domain tests exist, file sizes within `bp-conventions` limits.
