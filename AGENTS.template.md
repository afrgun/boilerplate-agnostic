<!-- TEMPLATE: copy to the target repo root as `AGENTS.md` (and CLAUDE.template.md as `CLAUDE.md`). Delete this comment after copying. -->
# AGENTS.md

Root instructions for AI coding agents working in a repository that adopts this guideline pack. `CLAUDE.md` and other agent files only point here — edit this file, never the pointers.

## Guideline root

- `<guideline>` = `guideline/` (change this line if the pack lives elsewhere).
- Stack facts live in `<guideline>/stack-profile.md`. Stack-specific methods and code templates live in `<guideline>/references/<stack>.md`, where `<stack>` is the `stack` value in the profile (`nextjs` | `react` | `angular`).
- **Before writing code, read `stack-profile.md` and the matching `references/<stack>.md`.** If the profile is missing or a needed section is empty, stop and ask the user (competition mode: see `bp-competition-mode` § Assumptions). Do not guess the stack, commands, or folder layout.

## Mode

- `stack-profile.md` → `mode` is `standard` (default) or `competition`.
- In `competition` mode, `bp-competition-mode` overrides the other skills where it says so, and **tier-3 skills are not used**. `bp-security` and the lint boundaries still apply in every mode.

## Use local skills

When a task matches one of these areas, the listed local skill is the primary instruction source and must be used first. Prefer these repo-local skills over global/home-level skills when both apply.

| Task | Skill | Tier |
|---|---|---|
| Layer boundaries, feature slicing, ports/adapters, mappers, `Result`, use case placement | `bp-architecture` | 1 |
| Building a feature end-to-end (requirements → spec → layers → DI → UI → verify), scaffolding | `bp-feature-lifecycle` | 1 |
| UI composition, shared atoms, atomic design placement, rendering API data | `bp-ui-components` | 1 |
| Naming, file size limits, folder layout, definition of done | `bp-conventions` | 1 |
| Staging, commits, branches, MR/PR descriptions | `bp-git-workflow` | 1 |
| Time-boxed work (competition, hackathon, POC) — whenever `mode: competition` | `bp-competition-mode` | 1 |
| Integrating a backend endpoint / API contract | `bp-api-integration` | 2 |
| Writing or fixing tests, test placement | `bp-testing` | 2 |
| Implementing a design from Figma, screenshots, or frame exports | `bp-figma-to-code` | 2 |
| Auth, tokens, user input, rendering HTML, secrets, error exposure | `bp-security` | 2 |
| Investigating a bug or unexpected behavior | `bp-debugging` | 2 |
| Recording technical lessons, promoting repeated mistakes to lint rules | `bp-second-brain` | 3 |
| Version bump, changelog, release tags | `bp-release` | 3 |
| Rendering, bundle, or data-loading performance | `bp-performance` | 3 |
| Migrating legacy code to the target architecture | `bp-refactor-legacy` | 3 |

One topic has exactly one owning skill. Skills reference each other instead of repeating rules; if two sources conflict, the owning skill wins.

## Hard rules (all tasks)

1. Dependency direction and import rules from `bp-architecture` are enforced by the lint config in `<guideline>/lint/`. Do not disable boundary rules to make code compile — fix the placement.
2. Raw API types never leave the infrastructure layer; adapters map them to domain types.
3. UI renders through shared atoms; see `bp-ui-components` for the list of forbidden raw elements.
4. No secrets, credentials, tokens, machine-specific paths, usernames, or drive letters in code, docs, or agent files. Resolve paths relative to the repo root; discover executables through `PATH`.
5. All code, comments, and identifiers are in English.
6. A task is done only when the done criteria in `bp-conventions` pass (commands come from `stack-profile.md`).

## Navigation (token-saving)

- If `<guideline>/page-map.md` exists, resolve vague UI terms ("bug in work type page") to files there before any broad search. If an entry is missing or stale, fix the map in the same change.
- If `<guideline>/second-brain/INDEX.md` exists, check it for known gotchas before debugging.
- Backend contracts live in the folder set in `stack-profile.md` → HTTP → API contracts location (default `<guideline>/api-contracts/`). Read them before integrating an endpoint.
- Starting formats for these project-owned files are in `<guideline>/scaffold/`.
- Folders under `src/` may contain a short `AGENTS.md` (with a `CLAUDE.md` pointer). Read it before editing files in that folder; the full rules stay in the owning skill it names.

## Maintenance

- Skills are edited only in `<guideline>/skills/tier-*/` and copied to agent folders with `node <guideline>/scripts/sync-skills.mjs`. Never edit the copies (if `<guideline>/hooks/` is installed, such edits are blocked automatically).
- A new skill must be added to the table above and to `<guideline>/README.md`, using the `bp-` prefix.
- When a reference pattern changes in code, update the matching skill or `references/<stack>.md` in the same change.
