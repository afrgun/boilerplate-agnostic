# bp-debugging — Examples

## 1. Tracing the layer

Symptom: *"Bank list is empty for some users."*

| Step | Check | Finding |
|---|---|---|
| Locate | `page-map.md` → "bank list" → `/topup`, `topup-store`, `http-bank-repository`, `bank.mapper` | Read only these |
| Second brain | Search "empty list", "enum" | Nothing relevant |
| Network | Response for an affected user | 6 banks returned, `active: "y"` (lowercase) |
| Mapper | `isActive: raw.active === 'Y'` | Lowercase `"y"` → `false` |
| Domain | `selectableBanks` filters inactive | Everything filtered out → empty list |

First wrong layer: **mapper** (normalization). Fix there, not in the component.

## 2. Bad vs good fix

| ❌ | Why | ✅ |
|---|---|---|
| In the page: `if (banks.length === 0) banks = rawBanks` | Silences the symptom, bypasses the domain rule | Mapper: `isActive: raw.active?.toUpperCase() === 'Y'` |
| `catch { return [] }` in the adapter | Hides real failures as "empty" | Return `err(...)`; UI shows the error state |
| Three changes at once (mapper + store + page) | Cannot tell which one fixed it | One hypothesis, one change |

## 3. Regression test

```ts
it('treats lowercase "y" as active', () => {
  expect(toBank({ bank_code: 'BCA', bank_name: 'BCA', active: 'y', other: false, logo: null })?.isActive).toBe(true);
});
```

## 4. Report

```markdown
Symptom: bank list empty for some users.
Root cause: backend returns `active: "y"` for migrated banks; mapper compared case-sensitively
(src/features/topup/infrastructure/bank.mapper.ts:14).
Fix: case-insensitive comparison in the mapper.
Test: bank.mapper test "treats lowercase y as active" (fails before, passes after).
Follow-ups: ask backend to normalize flags; second-brain note added (01-bugs-and-gotchas, tag: enum-normalization).
```
