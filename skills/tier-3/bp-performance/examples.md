# bp-performance — Examples

Framework techniques live in `references/<stack>.md` and installed vendor skills; these examples show **how to measure, decide, and report**.

## 1. Measure before fixing

Complaint: *"The top-up page is slow."*

| Measurement | Result | Reading |
|---|---|---|
| Network panel on first load | `GET /banks` 120 ms, then `GET /profile` 110 ms, then `GET /invoices?page=1` 300 ms — **sequential** | Waterfall: ~530 ms of waiting that could be ~300 ms |
| Requests per visit | `GET /banks` fired **3×** (page, bank picker, header badge) | Duplicate fetching |
| JS for `/topup` route | 410 KB, of which a rich-text editor 180 KB (only used on the admin notes tab) | Heavy widget loaded eagerly |
| Render count when typing the amount | Whole bank list (40 cards) re-renders on every keystroke | State too high in the tree |

Fix in order of measured cost: waterfall → duplicates → bundle → re-renders.

## 2. Principle → fix

| Problem | ❌ | ✅ |
|---|---|---|
| Waterfall | Each component fetches its own data after mounting | Start independent requests in parallel at the route/page level |
| Duplicate requests | Three components call the bank port separately | One cached source (the stack's query cache or the feature store); components read from it |
| Heavy widget | Editor imported at the top of the route | Lazy-load the editor only when the admin notes tab opens |
| Re-renders | `amount` state lives in the page that also renders the bank list | Keep `amount` inside `AmountForm`; pass only the submitted value up |
| Over-fetching | `GET /invoices` returns 500 rows, UI shows 10 | Server pagination (`page`, `pageSize`) |
| Long list | 1,000 transaction rows rendered at once | Pagination or list virtualization |
| Work in render | Sorting + formatting 500 invoices inside the template on every render | Derived/memoized value or a domain function called once per data change |

## 3. Report

```markdown
Performance — /topup

Before → after (same device, cold cache, 3-run median)
- Time to bank list visible: 1.9 s → 1.1 s
- Requests on first load: 7 → 4 (/banks deduplicated)
- Route JS: 410 KB → 230 KB (editor lazy-loaded)
- Bank list re-renders while typing amount: 40 per keystroke → 0

Changes
- Parallel requests at page level for banks + profile + invoices
- Bank data read from the shared cache in picker and header badge
- Admin notes editor lazy-loaded
- Amount state moved into AmountForm

Behavior: unchanged; tests green.
```

## 4. Not acceptable

```markdown
Added memoization everywhere to make it faster.
```

Problems: no measurement, no before/after, blanket memoization adds complexity without proof.
