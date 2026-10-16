---
name: bp-refactor-legacy
description: Use when migrating existing (legacy) code toward the target architecture — moving logic out of large components or helpers, introducing ports/adapters/mappers, or splitting horizontal layers into feature slices — without a big-bang rewrite.
---

# Refactor Legacy (strangler approach)

Target shape comes from `bp-architecture`; tests from `bp-testing`.

## Rules

1. **Freeze the old pattern**: new code always uses the target structure. Boundary lint rules apply to `features/**` first, then widen.
2. **Migrate what you touch**: refactor the area of the current task, not the whole codebase.
3. **Characterize before changing**: add tests that pin current behavior of the piece being moved (even if the behavior is odd), then refactor.
4. **One axis per step**, each step compiling and green:
   1. extract pure business logic from components/helpers into `domain/` functions + tests;
   2. add a mapper to the existing adapter so domain types stop mirroring raw API data;
   3. introduce a store/state hook between components and data access;
   4. move the slice into `features/<x>/` and register providers in the feature composition root;
   5. delete pass-through use cases and the old wiring.
5. **Keep public behavior identical** unless the task says otherwise; report any behavior change explicitly.
6. **Keep compatibility shims short-lived**: mark them with the ticket that removes them.

## Signals that code needs this skill

- Components or services over the size limits in `bp-conventions`.
- Business rules inside UI components or global "helper" services.
- Use cases that only forward to a repository.
- Raw API types (envelopes, `any`) inside domain types.
- Components calling HTTP clients or repositories directly.
- One central file registering every dependency of the app.

## Report

Per step: what moved where, tests added, behavior changes (if any), remaining legacy in the area.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
