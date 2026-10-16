---
name: bp-second-brain
description: Use when recording a non-obvious technical lesson (bug root cause, performance fix, architectural decision, tooling/CI gotcha), when asked to update the second brain from recent commits or merge requests, or when the same mistake appears again.
---

# Second Brain

Curated technical knowledge of the repo, so lessons survive beyond one session or one person.

## Location

`<guideline>/second-brain/`:

```
INDEX.md                 # files, status, "Last processed: <commit hash>", tag index
01-bugs-and-gotchas.md
02-performance.md
03-best-practices.md
04-decisions.md
05-tooling-ci.md
```

On first use, copy `<guideline>/scaffold/second-brain/` to `<guideline>/second-brain/` (INDEX + 5 category files with the note templates). The copy is project-owned.

## What goes in

Only technical knowledge: bugs with a technical root cause, refactors with a reason, performance work, decisions (including rejected alternatives), CI/tooling issues.
**Never** feature work, UI/style tweaks, wording, or content changes.

## Note formats

Deep note (knowledge-dense):

```markdown
### <short title>
**Problem**: <symptom and context>
**Root cause**: <why>
**Fix / decision**: <what changed> (`file:line`, short code excerpt)
**Lesson**: <rule to remember>
**Refs**: <commit hash>, MR !N
**Tags**: <tag>, <tag>
```

One-liner (small lessons): a table row `| lesson | commit | tags |`.

## Delta workflow

1. Read `Last processed` in `INDEX.md`.
2. List new non-merge commits since that hash; keep only technical ones.
3. For merged MRs, read descriptions and review threads — they hold root causes and rejected options.
4. Write notes into the matching category; register deep notes in the tag index.
5. Update `Last processed`.

## Promotion ladder

The same lesson biting **2–3 times** must be promoted:

1. A lint rule (preferred) in `<guideline>/lint/` or the repo lint config, or
2. A rule in the owning skill / `AGENTS.md` gotchas.

Mark the note `**Promoted**: <where>`.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
