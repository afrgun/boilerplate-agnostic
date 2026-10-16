---
name: bp-release
description: Use when preparing a release — bumping the version, writing the changelog, and creating environment or production tags.
---

# Release

## Stack context (read first)

Read `<guideline>/stack-profile.md` → **Git** and any release section the team adds (environments, tag format, who may tag production).

## Steps

1. **Confirm** target environment, version, and that the release branch/commit is the intended one. Production tags always need explicit user confirmation.
2. **Version**: semantic versioning — `MAJOR` breaking, `MINOR` feature, `PATCH` fix. Pre-releases use a suffix (`-rc.1`, or the team's environment suffix).
3. **Changelog**: generate from commits since the last tag, grouped by type (`feat`, `fix`, `refactor`, ...). Remove noise; keep user-facing wording.
4. **Bump** the version in the manifest in a dedicated commit (`chore: release vX.Y.Z`).
5. **Tag** with the agreed format; annotated tags with the changelog summary.
6. **Push** commit and tag only after confirmation.

## Rules

- Never move or delete an existing tag without explicit approval.
- Never tag from a dirty worktree.
- Verification (`bp-conventions` done criteria, including build) passes before tagging.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
