---
name: bp-git-workflow
description: Use when staging files, writing commits, creating or naming branches, pushing, or preparing a merge request / pull request title and description from branch changes.
---

# Git Workflow

## Stack context (read first)

Read `<guideline>/stack-profile.md` → **Git** (commit format, allowed types, ticket pattern, default branch, MR/PR tool).

If `mode: competition` in the profile, apply overrides from `bp-competition-mode`.

## Before committing

1. **Ask for the ticket** if not provided. Accept a raw key or a tracker URL; extract the bare key (e.g. URL `.../browse/ABC-123` → `ABC-123`).
2. Never invent placeholders (`n/a`, empty brackets).
3. If the worktree has unrelated changes, **confirm scope** and stage files explicitly — never `git add -A` on a mixed tree.
4. Run the done criteria in `bp-conventions` first.

## Commit

- Subject follows the profile format; imperative mood; ≤ 72 characters.
- Type reflects the change: `feat` (new behavior), `fix` (bug), `refactor` (no behavior change), `test`, `docs`, `chore`.
- Body: what and why, as a separate paragraph. No literal `\n` in the command; use a heredoc or multiple `-m`.
- One logical change per commit.
- Never skip hooks or signing unless the user explicitly asks.

## Branch

- Short-lived, task-focused: `<type>/<ticket>-<short-slug>`.
- Never commit directly to the default branch; branch first.

## Push

- Push only after scope and commit text are confirmed.
- Never force-push a shared branch unless the user explicitly asks.

## Merge request / pull request

Build the description from the diff against the target branch, not from memory:

```markdown
## Summary
<1–3 sentences: user-visible outcome>

## Changes
- <layer/area>: <what changed>

## How to test
1. <steps>

## Notes
<decisions, follow-ups, risks; screenshots for UI>
```

Title = commit-style subject with ticket. Use the tool from the profile (`glab` / `gh`); if it is not installed or authenticated, show the description and ask the user to create it.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
