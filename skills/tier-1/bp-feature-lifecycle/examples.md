# bp-feature-lifecycle — Examples

## 1. Phase 0 — one batch of grouped questions

Request: *"Build the top-up feature: user picks a bank, enters an amount, gets payment instructions."*

```markdown
Before I start, a few questions (answer what you can; I will note assumptions for the rest):

Scope & screens
1. Screens: bank list → amount form → instructions page. Is the instructions page new, or part of an existing "payments" area?
2. Should the user see past top-ups (history list) in this feature, or later?

API
3. Is there a contract for: list banks, create top-up, get instructions? (OpenAPI, doc, or a sample response.)
4. Business error codes for "amount below minimum" and "bank unavailable"?

Rules
5. Minimum / maximum amount? Fixed increments?
6. Which roles can top up?

States
7. What should the bank list show when no bank is active?
```

## 2. Phase 1 — spec file names

```
specs/topup/
├── 01-selectable-banks.md          # domain: filter + order
├── 02-validate-amount.md           # domain: min/max/increment
├── 03-bank-mapper.md               # infrastructure: raw → Bank, enum/field edge cases
├── 04-create-topup-use-case.md     # application: amount + bank availability + port call
├── 05-http-bank-repository.md      # infrastructure: success, HTTP error, business error, network error
└── 06-topup-store.md               # presentation: loading → ready / error transitions
```

## 3. Dry-run ("scaffold topup, plan only") output

```markdown
## Scaffold — topup (dry run, no implementation)

| Layer | File | Purpose |
|---|---|---|
| domain | src/features/topup/domain/bank.ts | Bank type, selectableBanks |
| domain | src/features/topup/domain/topup.ts | MIN_TOPUP, validateAmount, TopupInvoice |
| application | src/features/topup/application/bank-repository.ts | port |
| application | src/features/topup/application/topup-repository.ts | port |
| application | src/features/topup/application/create-topup.ts | use case (logic: amount + bank availability) |
| infrastructure | src/features/topup/infrastructure/bank.api.ts / bank.mapper.ts / http-bank-repository.ts | raw type, mapper, adapter |
| infrastructure | .../mock-bank-repository.ts | mock adapter |
| core | src/core/http/api-endpoints.ts | + API.topup.* |
| DI | per references/<stack>.md § 8 | register ports + use case |
| presentation | .../presentation/<store>, <pages> | store + 3 screens |

Skipped: none. Use case for "get banks" not created (pass-through).
Open questions: Q4 (business error codes) — mapped to 'unknown' until answered.
```

## 4. Final summary (phase 8)

```markdown
## topup — done

Verify: lint ✅ · typecheck ✅ · test ✅ (14 passed) · build ✅

Files per layer
- domain: bank.ts, topup.ts (+ tests)
- application: bank-repository.ts, topup-repository.ts, create-topup.ts (+ test)
- infrastructure: bank.api.ts, bank.mapper.ts (+ test), http-bank-repository.ts (+ test), mock-bank-repository.ts
- core: api-endpoints.ts (+ topup group)
- presentation: topup store, BankListPage, AmountForm, InstructionsPage
- page-map.md: added "top up, topup, isi saldo, bank list" → /topup

Decisions
- No GetBanks use case (pass-through).
- TOP40901 mapped to AppError 'conflict' → "Bank is temporarily unavailable".

Open
- Maximum amount not confirmed (assumed none).
```
