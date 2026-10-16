# Second Brain — technical knowledge of this repo

Curated **technical** lessons from commits and merge requests: bugs with a technical root cause, performance work, best practices, decisions, tooling/CI. Feature work, UI/style tweaks, wording, and content changes are excluded by design. Workflow and note formats: skill `bp-second-brain`.

## Files

| File | Contents |
|---|---|
| [01-bugs-and-gotchas.md](./01-bugs-and-gotchas.md) | Reactivity traps, leaks, stale state, timezone/date bugs, framework gotchas |
| [02-performance.md](./02-performance.md) | Rendering, bundle, caching, data-loading fixes |
| [03-best-practices.md](./03-best-practices.md) | DRY consolidation, type safety, a11y, DI hygiene, error handling, testing |
| [04-decisions.md](./04-decisions.md) | Architecture/contract decisions with rejected alternatives |
| [05-tooling-ci.md](./05-tooling-ci.md) | Pipeline, build, lint, dependency, and environment issues |

## Status

- **Last processed**: `<commit hash>` (`<YYYY-MM-DD>`)
- **Scanned**: `<n>` commits, MRs `!<from>`–`!<to>`

## Filter (what counts as technical)

Include: `fix` with a technical root cause, `refactor` with a reason, `perf`, `ci`, `build`, decision-grade `revert`, review threads that reject an approach.
Exclude: feature commits, UI/style/wording/content changes, merge commits, version bumps.

## Tag index

| Tag | Notes |
|---|---|
| `<tag>` | `<file>#<anchor>` |

## Promoted lessons

| Lesson | Promoted to | Date |
|---|---|---|
| `<lesson>` | `<lint rule / skill / AGENTS gotcha>` | `<YYYY-MM-DD>` |
