# bp-api-integration — Examples

Full adapter/mapper templates per stack: `references/<stack>.md` § 6. These examples focus on **contract → decisions**.

## 1. From a contract sample to a mapper

Contract (`<guideline>/api-contracts/topup.md`), `GET /topup/v1/banks`:

```json
{
  "status": { "code": "TOP20000", "message": "OK" },
  "data": [
    { "bank_code": "BCA", "bank_name": "Bank Central Asia", "active": "Y", "other": false, "logo": "https://cdn/bca.png", "sort": 1 },
    { "bank_code": "OTH", "bank_name": null, "active": "Y", "other": true, "logo": null, "sort": 99 }
  ],
  "meta": null
}
```

| Raw field | Domain field | Rule |
|---|---|---|
| `bank_code` | `code` | Required — missing → adapter returns `err` (`type: 'server'`), never fabricate an id |
| `bank_name` | `name` | `null` → fall back to `code` (display-only; documented in the mapper) |
| `active: "Y" \| "N"` | `isActive: boolean` | Normalize string flag to boolean |
| `other` | `isOtherBank` | Default `false` |
| `logo` | `logoUrl` | Keep `null`; UI decides the placeholder |
| `sort` | — | Dropped; ordering is a domain rule (`selectableBanks`) |
| `status`, `meta` | — | Never leave infrastructure |

```ts
export const toBank = (raw: BankApiItem): Bank | null => {
  if (!raw.bank_code) return null;                       // adapter turns any null into err(...)
  return {
    code: raw.bank_code,
    name: raw.bank_name ?? raw.bank_code,
    isActive: raw.active === 'Y',
    isOtherBank: raw.other ?? false,
    logoUrl: raw.logo ?? null,
  };
};
```

## 2. Success check: HTTP and business code

| Response | Adapter result |
|---|---|
| HTTP 200, `status.code = TOP20000` | `ok(banks)` |
| HTTP 200, `status.code = TOP40401` (no banks configured) | `err({ type: 'not_found', code: 'TOP40401', ... })` |
| HTTP 409, `TOP40901` | `err({ type: 'conflict', code: 'TOP40901', ... })` |
| HTTP 500 | `err({ type: 'server', ... })` |
| Network failure / timeout | `err({ type: 'network', ... })` |

Business codes live in the feature's constants and are translated in the shared normalizer — never compared in UI.

## 3. Endpoint constants

```ts
// ❌ in the adapter
http.get(`/topup/v1/banks?active=${onlyActive}`);

// ✅ core/http/api-endpoints.ts
export const API = {
  topup: {
    banks: '/topup/v1/banks',
    create: '/topup/v1/invoices',
    instructions: (invoiceId: string) => `/topup/v1/invoices/${encodeURIComponent(invoiceId)}/instructions`,
  },
} as const;
```

## 4. Contract given only in chat

User pastes a JSON sample in chat → save it to `<guideline>/api-contracts/topup.md` using `_template.md` (remove personal data) **before** writing the mapper, then cite that file in the summary.
