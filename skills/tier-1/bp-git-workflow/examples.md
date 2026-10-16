# bp-git-workflow — Examples

Assume profile commit format `<type>: [<ticket>] <subject>`, ticket pattern `ABC-123`.

## 1. Ticket from a URL

User: *"ticket https://tracker.example.com/browse/ABC-482"* → use `ABC-482`.

## 2. Commit subjects

| ❌ | Why | ✅ |
|---|---|---|
| `update` | No type, no ticket, no intent | `feat: [ABC-482] add bank list to top-up` |
| `fix: [n/a] bug` | Placeholder ticket, vague | `fix: [ABC-490] keep amount when bank becomes unavailable` |
| `feat: [ABC-482] Added the new top up feature with bank list, amount form, and instructions page plus tests` | Over 72 chars, past tense | `feat: [ABC-482] add top-up flow with bank list and instructions` |
| `refactor: [ABC-501] fix rounding of amount` | Behavior change labeled as refactor | `fix: [ABC-501] round top-up amount half up` |

## 3. Commit body

```
feat: [ABC-482] add bank list to top-up

Show active banks first and the "other bank" option last, using the
domain rule selectableBanks. Banks come from the new bank port with a
mock adapter for local development.
```

## 4. Mixed worktree

`git status` shows topup files **and** an unrelated change in the sidebar component.

- ❌ `git add -A`
- ✅ Ask: *"The sidebar change is unrelated to ABC-482 — include it, or leave it out?"* Then stage explicit paths.

## 5. Merge request description

```markdown
## Summary
Users can top up their balance: pick a bank, enter an amount, and get payment instructions.

## Changes
- domain: Bank, selectableBanks, validateAmount
- application: bank & topup ports, createTopup use case
- infrastructure: HTTP + mock adapters, mappers, endpoints
- presentation: topup store, BankListPage, AmountForm, InstructionsPage

## How to test
1. Log in as a customer, open /topup.
2. Pick a bank, enter 5,000 → error "Minimum top up is 10,000".
3. Enter 50,000 → instructions page shows the virtual account number.

## Notes
- Maximum amount not confirmed; no limit enforced yet.
- Screenshots: bank list, error state, instructions.
```
