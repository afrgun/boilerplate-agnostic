---
name: bp-performance
description: Use when a screen is slow, re-renders too often, loads too much data or JavaScript, or when reviewing code for rendering, bundle, or data-loading performance.
---

# Performance

Agnostic principles here; framework techniques in `<guideline>/references/<stack>.md`. If the profile lists vendor skills (**Vendor skills**; candidates per stack in `references/<stack>.md` § 1), use them alongside this skill.

## Measure first

1. Reproduce with numbers: load time, interaction latency, number of requests, bundle size, render counts.
2. Use the framework's profiler and the browser performance/network panels.
3. Fix the biggest measured cost first. No speculative micro-optimizations.

## Principles

| Area | Rule |
|---|---|
| **Data waterfalls** | Start independent requests in parallel; fetch at the highest sensible level (route/server) instead of chained component effects. |
| **Over-fetching** | Request only needed fields/pages; paginate and filter on the server. |
| **Duplicate requests** | Use the stack's cache/dedupe layer (query cache, store); never fetch the same data from two components separately. |
| **Re-renders** | Keep state as local as possible; derive values instead of storing duplicates; stable references for props passed to heavy children. |
| **Lists** | Stable keys/track; virtualize long lists. |
| **Bundle** | Lazy-load routes and heavy widgets (editors, charts, maps); avoid importing whole libraries for one function. |
| **Images & assets** | Correct sizes and formats, lazy-load below the fold. |
| **Work in render** | No heavy computation in templates/render; move to memoized/derived values or domain functions. |
| **Polling & streams** | Back off, stop when hidden/unmounted, clean up subscriptions/timers. |

## Done criteria

- Before/after numbers in the summary.
- No behavior change (tests still green).

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
