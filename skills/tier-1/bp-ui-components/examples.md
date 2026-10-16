# bp-ui-components — Examples

Markup below is **pseudo-markup** (stack-neutral). Real syntax per stack: `references/<stack>.md` § 10.

## 1. Placement decisions

| Element in the top-up screens | Level | Location |
|---|---|---|
| Primary/secondary buttons | Atom | `shared/ui` (`Button`) |
| Amount field with label + error text | Molecule | `shared/ui` (`FormField` + `Input`) |
| Bank card (logo, name, "other bank" badge) | Organism, feature-specific | `features/topup/presentation/bank-card` |
| Bank card reused later in "withdraw" feature | Promote | move to `shared/ui/organisms` only when the second feature needs it |
| Instructions page layout | Template | `features/topup/presentation` |
| `/topup` route | Page | route file per stack — wiring only |

## 2. Atoms vs raw elements

```
❌ <button class="px-4 py-2 rounded bg-red-600 text-white" onClick=submit>Top up</button>
✅ <Button variant="primary" onClick=submit>Top up</Button>

❌ <input type="number" class="border rounded px-3" value=amount />
✅ <FormField label="Amount" error=amountError><Input type="number" value=amount /></FormField>
```

No atom fits (e.g. a segmented amount picker)? Create `shared/ui/SegmentedControl` first, then use it.

## 3. Boolean props vs composition

```
❌ <BankCard bank=b showBadge showRadio isCompact hideLogo />
✅ <BankCard bank=b>
     <BankCard.Logo />
     <BankCard.Name />
     <BankCard.OtherBankBadge />
   </BankCard>
```

## 4. Missing values

```
❌ {invoice.paidAt || ''}             → renders empty cell
❌ {invoice?.paidAt ?? '-'}           → hand-written fallback, inconsistent formatting
✅ {formatOrDash(invoice.paidAt, formatDateTime)}
✅ {formatOrDash(invoice.amount, formatCurrency)}
```

## 5. Errors and states

| State | ❌ | ✅ |
|---|---|---|
| Loading | Blank area | `<Skeleton />` sized like the content |
| Empty | "No data" text in a `div` | `<EmptyState title="No active banks" description="Please try again later" />` |
| Error | `{error.response.data.message}` | `<ErrorState error=toUiError(error) onRetry=reload />` — title/message from the central message map by `AppError.type` |

## 6. Accessibility quick checks

- A clickable card that selects a bank is a `Button`/radio atom (keyboard + accessible name), not a `div` with a click handler.
- Icon-only buttons have an accessible label ("Copy virtual account number").
- Error text is linked to its field by the `FormField` molecule.
