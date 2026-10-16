# bp-architecture — Examples

Fictional feature used across all skill examples: **`topup`** (list banks, create a top-up invoice). Stack-specific code lives in `references/<stack>.md`; these examples show **placement decisions** and framework-free TypeScript only.

## 1. Where does this logic go?

| Logic | Wrong place | Right place | Why |
|---|---|---|---|
| "Show only active banks, other-bank option last" | Component filters `banks.filter(b => b.isActive)` inline | `domain/bank.ts` → `selectableBanks(banks)` | Business rule; reused by list and picker; unit-testable without UI |
| "Minimum top-up is 10,000" | Form component `if (amount < 10000)` | `domain/topup.ts` → `MIN_TOPUP` + `validateAmount()`; use case calls it | Rule must hold for every entry point (form, retry, deep link) |
| "Selected bank must still be active before creating invoice" | Store calls `getBanks()` then `create()` | Use case `createTopup` in `application/` | Orchestrates two ports + a rule → real use case |
| "Fetch banks" with no extra logic | `GetBanksUseCase` that only calls `repo.getBanks()` | Store/hook calls the port directly | Pass-through use case adds a file and nothing else |
| Backend sends `"FINISHED"` / `"finish"` / `"Finished"` | Component `status.toLowerCase() === 'finish'` | Mapper normalizes to enum `TopupStatus.Finish` | Transport quirk; domain sees one value |
| Build `/topup/v1/banks?active=true` | Adapter string literal | `core/http/api-endpoints.ts` → `API.topup.banks` | One place to change URLs |
| HTTP 409 + code `TOP40901` → "Slot full" message | Component `if (err.status === 409)` | Normalizer maps to `AppError.type = 'conflict'`, message map renders text | UI branches on `type`, never on raw codes |
| Loading flag, selected bank, dialog open | Domain or use case | Presentation store/hook | UI state, not business |

## 2. Good vs bad: domain rule

```ts
// ✅ domain/bank.ts — pure, framework-free, tested
export interface Bank { readonly code: string; readonly name: string; readonly isActive: boolean; readonly isOtherBank: boolean }

export const selectableBanks = (banks: readonly Bank[]): Bank[] =>
  banks.filter((b) => b.isActive).sort((a, b) => Number(a.isOtherBank) - Number(b.isOtherBank));
```

```ts
// ❌ rule hidden in a component/store, mixed with transport shape
const visible = response.data.data.filter((b: any) => b.is_active === true || b.is_active === 'Y');
```

Problems: `any`, raw API field names in presentation, rule not reusable, envelope (`data.data`) leaked.

## 3. Good vs bad: use case existence

```ts
// ❌ pass-through — delete it; the store calls bankRepository.getBanks() directly
export class GetBanksUseCase {
  constructor(private readonly repo: BankRepository) {}
  execute() { return this.repo.getBanks(); }
}
```

```ts
// ✅ real use case — validation across data + two ports
export const createTopup = (deps: { topups: TopupRepository; banks: BankRepository }) =>
  async (input: CreateTopupInput): Promise<Result<TopupInvoice, AppError>> => {
    const amountError = validateAmount(input.amount);          // domain rule
    if (amountError) return err(amountError);
    const banks = await deps.banks.getBanks();
    if (!banks.ok) return banks;
    if (!selectableBanks(banks.value).some((b) => b.code === input.bankCode)) {
      return err({ type: 'validation', message: 'Selected bank is not available' });
    }
    return deps.topups.create(input);
  };
```

## 4. Import decisions (what lint will say)

| From → To | Allowed? | Fix if not |
|---|---|---|
| `features/topup/presentation` → `features/topup/application/bank-repository` (type) | ✅ | — |
| `features/topup/presentation` → `features/topup/infrastructure/http-bank-repository` | ❌ | Get the port through the stack's DI accessor (`references/<stack>.md` § 8) |
| `features/order/domain` → `features/topup/domain/bank` | ❌ | Move the shared type to `shared/` or duplicate a minimal local type |
| `features/topup/domain` → a UI framework package or an HTTP client | ❌ | Domain is framework-free; move the code to presentation or infrastructure |
| `core/di` → `features/topup/infrastructure/http-bank-repository` | ✅ | `di` is allowed to name adapters |
| `features/topup/presentation` → `app/...` | ❌ | Nothing imports the composition root |

## 5. Splitting a "lightweight" screen

The invoice list only needs `id`, `amount`, `status`, `createdAt`, while the detail needs 20 fields.

- ❌ Make all 20 fields optional on `TopupInvoice` so the list mapper can skip them.
- ✅ Add `TopupInvoiceSummary` (4 required fields) in `domain/`, a `toTopupInvoiceSummary()` mapper, and keep `TopupInvoice` strict.
