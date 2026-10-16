# Stack Profile

> Copy to `stack-profile.md` and fill every section. Skills read this file; an empty section makes them stop and ask.

| Key | Value |
|---|---|
| mode | `standard` (default) \| `competition` — see skill `bp-competition-mode` |
| stack | `nextjs` \| `react` \| `angular` |
| framework version | e.g. Next.js 15 / React 19 + Vite / Angular 19 |
| language | TypeScript (strict) |
| package manager | npm \| pnpm \| yarn |

## Tooling versions (pinned)

| Tool | Version |
|---|---|
| framework | |
| typescript | `^5` |
| eslint | `^9` |
| eslint-plugin-boundaries | `^7` (lint config is written for v7 — do not downgrade) |
| eslint-import-resolver-typescript | `^4` |
| typescript-eslint | `^8` |
| test runner | |

## Vendor skills

Optional third-party skills installed for this stack (candidates in `references/<stack>.md` § 1). Record the source so every teammate installs the same version.

| Skill | Source | Version | Installed to |
|---|---|---|---|
| | | | |

## Commands

| Purpose | Command |
|---|---|
| dev | |
| lint | |
| typecheck | |
| test (all) | |
| test (single file) | |
| build | |

## Layer map

| Layer | Folder |
|---|---|
| kernel (`Result`, `AppError`) | `src/shared/kernel` |
| shared UI atoms | `src/shared/ui` |
| shared pure helpers (`formatOrDash`, ...) | `src/shared/lib` |
| app-wide infrastructure (http client, auth, observability) | `src/core` |
| DI accessors (`usePorts` / `createServerPorts`) | `src/core/di` |
| composition root (route/app shell) | `src/app` |
| feature domain | `src/features/<feature>/domain` |
| feature application (ports, use cases) | `src/features/<feature>/application` |
| feature infrastructure (adapters, mappers, endpoints) | `src/features/<feature>/infrastructure` |
| feature presentation (store, components) | `src/features/<feature>/presentation` |
| routes / pages | |

## Dependency injection

| Key | Value |
|---|---|
| mechanism | (see `references/<stack>.md` § DI) |
| port token | abstract class \| interface + key |
| composition root location | |

## State

| Key | Value |
|---|---|
| server state | |
| client/UI state | |

## HTTP

| Key | Value |
|---|---|
| client | fetch \| axios \| HttpClient |
| base URL source | |
| endpoints file | `src/core/http/api-endpoints.ts` |
| error normalizer | `src/core/http/to-app-error.ts` |
| API contracts location | `<guideline>/api-contracts/` (one file per feature) |
| backend envelope shape | e.g. `{ status: { code, message }, data, meta, error }` |
| backend success codes | |

## Testing

| Key | Value |
|---|---|
| unit runner | |
| component testing | |
| e2e | |
| test location | `__tests__/` next to source \| `*.test.ts` beside file |

## Naming

| Item | Convention |
|---|---|
| files | kebab-case |
| components | PascalCase |
| functions, variables, stores | camelCase |

## Shared UI atoms available

| Atom | Path |
|---|---|
| Button | |
| Input | |
| Select | |
| Table | |
| Pagination | |
| Modal | |

## Git

| Key | Value |
|---|---|
| commit format | e.g. `<type>: [<ticket>] <subject>` |
| allowed types | feat, fix, refactor, test, chore, docs |
| ticket pattern | e.g. `ABC-123` |
| default branch | |
| MR/PR tool | glab \| gh |
