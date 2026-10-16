---
name: bp-architecture
description: Use when writing, moving, or reviewing feature code and you must decide which layer owns it — domain, application (ports/use cases), infrastructure (adapters/mappers), or presentation — including feature slicing, mappers, Result handling, and dependency direction.
---

# Architecture (Clean Architecture + Feature Slices)

Owning skill for layer boundaries and feature slicing. Other skills reference this one instead of restating its rules.

## Stack context (read first)

1. Read `<guideline>/stack-profile.md` → `stack`, **Layer map**, **Dependency injection**, **State**, **HTTP**.
2. Read `<guideline>/references/<stack>.md` → § 2 folder map, § 4–9 templates.
3. If the profile is missing or a needed section is empty: **stop and ask** (competition mode: see `bp-competition-mode` § Assumptions). Do not invent folders or mechanisms.

## Layers

| Layer | Owns | Must not |
|---|---|---|
| `shared/kernel` | `Result<T, E>`, `AppError` | import anything else |
| `shared/lib` | Pure cross-feature helpers (e.g. `formatOrDash`) | import framework, I/O, features |
| `features/<x>/domain` | Plain types, value objects, **pure business rules** | import framework, HTTP, storage, other layers; be async |
| `features/<x>/application` | **Ports** (contracts) and **use cases** (only when they hold logic) | import infrastructure, presentation, framework UI/DI APIs |
| `features/<x>/infrastructure` | Adapters implementing ports, **mappers**, raw API types, endpoint usage | import presentation; leak raw API types upward |
| `features/<x>/presentation` | Store/state hooks, components, pages | import infrastructure (adapters are named only in the composition root) |
| `core` | App-wide infrastructure: http client, auth, interceptors, observability | contain business rules; import features |
| `core/di` | DI accessors presentation may use (`usePorts`, `createServerPorts`); may name adapters | contain business rules |
| `app` (composition root) | Route/app shell; instantiates and wires everything | be imported by any other layer |
| `shared/ui` | Reusable UI atoms/molecules | contain business rules or fetch data |

Dependency direction: `presentation → application → domain ← infrastructure`. Enforced by `<guideline>/lint/`.

## Core rules

1. **Slice by feature.** New capability = new folder under `features/`. A feature never imports another feature; shared contracts move to `shared/`.
2. **Every external call goes through a port** declared in `application/` and implemented by an adapter in `infrastructure/`.
3. **Ports return `Promise<Result<T, AppError>>` and never throw.** Adapters catch transport errors and convert them with the shared error normalizer.
4. **Adapters must map** raw API data to domain types through a dedicated mapper (`toX()`). Raw API types (`*ApiItem`, envelopes, `status.code`) never leave `infrastructure/`.
5. **Domain types are normalized**: no `any`, no transport optionality mirrored from the API, enums for stable vocabularies, dates as one consistent type.
6. **Business rules are pure functions in `domain/`** (e.g. `selectableBanks`, `canApprove`). Not in components, stores, helpers, or adapters.
7. **Create a use case only when it holds logic** (validation across data, orchestration of several ports, policy). A use case that only forwards one port call must not exist — the store/hook calls the port directly.
8. **Presentation only renders and coordinates UI state.** Data loading and branching on `Result` happen in the store/hook, not in templates.
9. **Adapters are named only in the composition root (`app` and `core/di`).** Presentation may call DI accessors from `core/di`, never adapters directly (see `references/<stack>.md` § 8).
10. **Endpoints live in one file** (`core/http/api-endpoints.ts`); no inline URL strings in adapters.
11. **Error mapping is centralized**: HTTP status and backend business codes → `AppError.type` in one normalizer; UI titles/messages from one message map.

## Decision guide

- Logic decides *what is allowed / what the data means* → `domain/`.
- Logic coordinates *several ports or validates input across data* → use case in `application/`.
- Logic knows *URLs, headers, JSON shapes, status codes, storage keys* → `infrastructure/`.
- Logic manages *loading flags, selection, dialogs, form state* → `presentation/`.
- Two features need the same type or rule → move it to `shared/`; never import across features.
- The API returns fields the screen does not need → drop them in the mapper.
- A screen needs a lightweight subset → define a small domain type for it; do not weaken the main entity with optional fields.
- You are tempted to add a "service" or "helper" with business rules → it is a domain function or a use case.

## Done criteria

- Lint boundary rules pass (`<guideline>/lint/`).
- No raw API type is imported outside `infrastructure/`.
- No pass-through use case was added.
- Every new adapter has a mapper and returns `Result`.
- `bp-conventions` done criteria pass.

## References

- Concepts and full templates: `<guideline>/references/<stack>.md`.
- Enforcement: `<guideline>/lint/eslint.boundaries.mjs` (element list in `<guideline>/lint/README.md`).

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
