# bp-competition-mode — Examples

## 1. ASSUMPTIONS.md entries

```markdown
## Assumptions

- Page size 10 for the invoice list — not specified; default from references/<stack>.md — change PAGE_SIZE in src/features/topup/presentation/topup-store
- Minimum top-up 10,000, no maximum — brief only mentions "minimum" — change MIN_TOPUP in src/features/topup/domain/topup.ts
- Bank API not available yet; mock adapter with 4 banks — no backend URL given — turn off the mock flag in env (name in stack-profile.md) and fill API.topup in api-endpoints.ts
- Currency IDR, no decimals — locale not specified — change formatCurrency in src/shared/lib/format.ts

## Not done

- Top-up history list — out of time; port exists, no screen
- E2E tests — only domain and mapper tests written
```

## 2. Ask vs assume

| Situation | Competition mode action |
|---|---|
| Page size unknown | Assume, record |
| Brand color not given | Use existing token/theme default, record |
| No backend yet | Mock adapter behind the port, record |
| "Delete the old demo data in the database?" | **Stop and ask** (destructive) |
| "API key for the payment sandbox?" | **Stop and ask** (secret) — use an env placeholder meanwhile |
| "Switch to another UI kit to go faster?" | **Stop and ask** (changes the stack) |

## 3. Trimmed lifecycle for "build top-up in 3 hours"

| Phase | Action |
|---|---|
| 0 | One question batch (or none) → assumptions recorded |
| 1 | Skipped (no spec files) |
| 2 | `selectableBanks`, `validateAmount` + tests |
| 3 | Bank & topup ports |
| 4 | `createTopup` (has logic) |
| 5 | Mapper + test, HTTP adapter, mock adapter (backend missing) |
| 6 | DI wiring |
| 7 | Main flow screens with loading/empty/error |
| 8 | lint + typecheck + build + domain/mapper tests |

## 4. Commits in competition mode

```
feat: add bank list with mock adapter
feat: add amount validation and create top-up use case
fix: keep entered amount after bank list refresh
```
