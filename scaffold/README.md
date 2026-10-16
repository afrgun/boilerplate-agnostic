# Scaffold — starting files for project-owned data

Files here are **starting formats** for data that belongs to each target project, not to the pack. Copy them once during adoption (or let the owning skill copy them on first use), then the project edits its copy.

| Scaffold file | Copy to (target repo) | Owning skill |
|---|---|---|
| `page-map.md` | `<guideline>/page-map.md` | `bp-feature-lifecycle` (keeps it current), AGENTS § Navigation |
| `second-brain/` (INDEX + 5 categories) | `<guideline>/second-brain/` | `bp-second-brain` |
| `api-contracts/README.md` + `_template.md` | `<guideline>/api-contracts/` | `bp-api-integration` |
| `ASSUMPTIONS.md` | repo root `ASSUMPTIONS.md` (competition mode only) | `bp-competition-mode` |
| `layer-agents/src/**` (`AGENTS.md` + `CLAUDE.md` pointer per folder) | same paths under the target repo's `src/` — copy the whole `layer-agents/src/` tree; skip `core/di/` for stacks without DI accessors (Angular) | `bp-architecture` (short local reminders; agents read them when working in that folder) |

These copies are **project-owned**: when upgrading the pack to a newer version, never overwrite them (see `README.md` § Upgrade).
