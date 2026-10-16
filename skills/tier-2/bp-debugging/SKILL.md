---
name: bp-debugging
description: Use when investigating a bug, failing test, regression, or unexpected UI/data behavior — before proposing any fix.
---

# Debugging

No fix before a confirmed root cause.

## Steps

1. **Locate fast**: resolve vague terms through `<guideline>/page-map.md` (if present). Check `<guideline>/second-brain/` for a known gotcha matching the symptom.
2. **Reproduce**: exact steps, data, role, environment. If it cannot be reproduced, gather evidence (logs, network response, screenshots) before touching code.
3. **Trace the layer**: follow the data path presentation → store → port → adapter → mapper → API response. Find the first layer where data is wrong.
4. **Hypothesis → evidence**: state one hypothesis, verify it with a log, test, breakpoint, or network capture. Discard and repeat if wrong.
5. **Fix at the owning layer** (`bp-architecture`): a mapping bug is fixed in the mapper, not patched in the component.
6. **Regression test** that fails before the fix and passes after (`bp-testing`).
7. **Record** the lesson in the second brain if the root cause was non-obvious (`bp-second-brain`).

## Rules

- Do not stack speculative fixes; one change per hypothesis.
- Do not silence errors (empty `catch`, `?? []` over a real failure) to make symptoms disappear.
- If the root cause is in the backend contract, report it with the evidence instead of hiding it in the frontend.
- Remove temporary logs before finishing.

## Report

Symptom → root cause (file:line) → fix → test → follow-ups.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
