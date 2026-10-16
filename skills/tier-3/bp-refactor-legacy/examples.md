# bp-refactor-legacy — Examples

Legacy situation (fictional, typical): a `TopupPage` component of 1,800 lines that calls the HTTP client directly, holds the "minimum amount" and "active bank" rules inline, renders raw backend fields (`bank.bank_name`, `inv.created_at`), and a global `HelperService` with 40 unrelated methods. A central DI file registers every service in the app.

## 1. Plan — one axis per step, each step green

| Step | Change | Safety net | Result |
|---|---|---|---|
| 0 | Characterization tests on current behavior (amount validation messages, which banks appear) | New tests pin today's behavior, even odd parts | Red/green baseline |
| 1 | Extract rules to `domain/`: `selectableBanks`, `validateAmount` + unit tests; component calls them | Step 0 tests still pass | Rules testable, component −120 lines |
| 2 | Add `bank.mapper.ts` in the existing data layer; component receives `Bank` instead of raw JSON | Mapper tests (full, missing, enum) | Raw field names gone from UI |
| 3 | Introduce bank/topup ports + adapters wrapping the old HTTP calls | Adapter tests with fake HTTP | Component no longer imports the HTTP client |
| 4 | Introduce feature store between component and ports; split component into `BankPicker`, `AmountForm`, `InstructionsPanel` | Component tests on visible behavior | Page = composition + store wiring |
| 5 | Move the slice to `features/topup/`; register its providers in the feature composition root; remove entries from the central DI file | Lint boundaries enabled for `features/topup/**` | Isolated feature |
| 6 | Delete pass-through use cases and dead `HelperService` methods used only by top-up | Search shows no remaining callers | Legacy removed for this area |

Unrelated parts of `HelperService` stay until a task touches them.

## 2. Behavior change found during step 0

Characterization test shows: amount `10,000` is **rejected** today although the product rule says "minimum 10,000" (inclusive).

- ❌ Silently fix it inside the refactor.
- ✅ Keep current behavior in the refactor, report it, and fix it in a separate change with its own ticket and test.

## 3. Compatibility shim

```ts
// src/legacy/topup-helper.ts
// TEMPORARY (ABC-530): old screens still call HelperService.validateTopupAmount.
// Delegates to the domain rule; remove when the invoice screen migrates (ABC-531).
export const validateTopupAmount = (amount: number) => validateAmount(amount);
```

Shims have a ticket that removes them; no new code may call them.

## 4. Report per step

```markdown
Step 2 — bank mapper
Moved: raw bank field access from TopupPage (14 places) → infrastructure/bank.mapper.ts
Tests: bank.mapper (5 cases), characterization tests still green
Behavior changes: none
Remaining legacy in area: HTTP calls in TopupPage (step 3), HelperService.formatAmount (used by 3 other screens — out of scope)
```
