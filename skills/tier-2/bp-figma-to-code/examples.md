# bp-figma-to-code — Examples

## 1. Surface classification

| Design evidence | Repo evidence | Classification |
|---|---|---|
| Frame "Top Up / Select Bank", sidebar item "Top Up" active | No `topup` feature, no `/topup` route | **New feature page** → new `features/topup` |
| Frame "Profile – v2" with same fields, new layout | `features/profile` exists with `/profile` | **Existing page redesign** |
| Frame "Components / Status Badge" with 5 variants | Badge used inline in 3 features with different styles | **Shared component extraction** → `shared/ui` atom |
| Frame "Top Up / Bank card – selected state" | `features/topup` exists | **Feature-local component addition** |
| Frames "Top Up 1/3, 2/3, 3/3" with stepper | `features/topup` has only step 1 | **Stateful flow extension** |

Trap: a list screen with title, filters, CTA, table, pagination looks similar to the existing dashboard — it is still a **management page**; do not render it as dashboard cards.

## 2. Source of truth decisions

| Situation | Action |
|---|---|
| Figma tool returns node data + screenshot | Use it (rank 1) |
| Figma link, tool says "no access" | Not usable → ask for a screenshot/frame export (competition mode: assume from closest repo pattern, record in `ASSUMPTIONS.md`) |
| User sends a screenshot only | Use it (rank 2); state that spacing values are estimated |
| No design, user says "make it like the invoice page" | Repo evidence (rank 4) — user explicitly accepted an approximation |

## 3. Element mapping table (put in the summary)

| Design element | Repo component | Note |
|---|---|---|
| Primary button "Continue" | `Button variant=primary` | — |
| Amount input with "Rp" prefix | `FormField` + `Input` (prefix slot) | Prefix slot added to `Input` atom |
| Bank tiles grid | `BankCard` (feature organism) | New |
| Copy icon next to VA number | `IconButton` | label "Copy virtual account number" |
| Divider with "or" | **native `hr`** | Exception: no divider atom and one-off; listed per rule |

## 4. Tokens

| Design value | ❌ | ✅ |
|---|---|---|
| `#DC2626` primary | hardcoded hex in the component | existing token `primary-600` |
| 14px / 20px text | inline style | typography token / utility already defined |
| New brand gradient | hardcoded in one page | add a token centrally, then use it |
