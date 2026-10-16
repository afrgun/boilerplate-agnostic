---
name: bp-testing
description: Use when adding or changing behavior that needs tests, writing behavior specs, fixing failing tests, or deciding which tests are required for a change and where they go.
---

# Testing Strategy

## Stack context (read first)

Read `<guideline>/stack-profile.md` → **Testing** (runner, component testing, e2e, location) and `<guideline>/references/<stack>.md` § 12.

If `mode: competition` in the profile, apply overrides from `bp-competition-mode`.

## What must be tested

| Target | Required? | Style |
|---|---|---|
| Domain functions | **Yes — test-first** | Pure unit tests, no mocks |
| Mappers | **Yes — test-first** | Full payload, missing fields, unknown enums, bad dates |
| Use cases | **Yes — test-first** | Fake ports (plain objects) |
| Adapters | Yes | Fake HTTP / HTTP testing utilities → assert `Result` ok/err |
| Store / state hooks | Yes for branching logic | Fake ports, assert state transitions |
| Components | When they hold interaction logic | Testing Library, user-visible behavior |
| Full flows | Critical paths only | e2e |

Purely mechanical changes (renames, moves) need no new tests — say so explicitly.

## Red → green → refactor (for required targets)

1. Write the smallest test describing the behavior; run it; see it fail for the right reason.
2. Implement the minimum to pass.
3. Refactor with tests green.

## Specs (used by `bp-feature-lifecycle` phase 1)

```markdown
# NN — <subject>
Subject: <function/store/adapter under test>
Fakes: <ports or http to fake>

## When <condition>
- Given <state>
- When <action>
- Then <observable outcome>
```

## Rules

1. Assert observable behavior, not implementation details or call counts unless the call *is* the behavior.
2. Fake at the boundary (ports, HTTP); never mock the unit under test.
3. No snapshot tests for logic; snapshots only for stable rendered markup, sparingly.
4. Each test is independent: fresh store/query client/DI container per test.
5. Test file location and naming follow the profile.
6. A bug fix comes with a regression test that fails before the fix.

## Done criteria

- Required targets above have tests.
- Test command from the profile passes for the touched area.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
