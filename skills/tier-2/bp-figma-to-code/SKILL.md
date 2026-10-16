---
name: bp-figma-to-code
description: Use when implementing UI from a Figma link, screenshot, or frame export — classifying the surface, choosing the design source of truth, mapping to existing components, and handling unreadable Figma nodes.
---

# Figma to Code

Composition rules come from `bp-ui-components`; feature placement from `bp-architecture`.

## 1. Classify the surface (exactly one)

1. New feature page
2. Existing page redesign
3. Shared component extraction
4. Feature-local component addition
5. Stateful flow extension (wizard, multi-step form)

Use visual evidence (title, active menu item, breadcrumb, tabs, frame name) **and** repo evidence. If the design shows a surface that does not exist in the repo, it is a **new feature page** — do not map it onto the closest existing page.
Keep the surface type from the design: a list-management screen (title, filters, CTA, table, pagination) stays a management page, not a dashboard.

## 2. Source of truth (strongest first)

1. Figma node data + screenshot (via Figma tooling)
2. User-provided screenshot / frame export
3. Figma link metadata + explicit user description
4. Repo evidence only — **only if the user explicitly accepts an approximation**

If the Figma node cannot be read (no access, tool error, wrong node), it is **not** a usable source. Stop and ask for a screenshot or frame export (competition mode: see `bp-competition-mode` § Assumptions).

## 3. Map before building

1. List every visual element and map it to an existing atom/molecule/organism.
2. Unmapped element → create/extend the shared component first (`bp-ui-components`), then use it.
3. Map design colors/spacing/typography to existing tokens; never hardcode values that a token covers. New token → add it centrally.
4. Assets (icons, images): check existing asset folders and icon components before adding new files.

## 4. Build

- Static structure first, then states (loading, empty, error, disabled), then interactions, then data wiring through the store.
- Data that comes from the API goes through the feature's port/adapter — never hardcode sample data from the design in components.

## Done criteria

- Surface classification and source of truth stated in the summary.
- Every native HTML exception listed with tag, file, and reason no atom fits.
- States from the design implemented.
- Visual check is done by the user unless the profile/team says otherwise.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
