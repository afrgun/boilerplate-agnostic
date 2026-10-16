# bp-security — Examples

## 1. Bad vs good

| Area | ❌ | ✅ |
|---|---|---|
| HTML from API (payment instructions) | Render raw HTML from the response | Pass through the project's single sanitizer helper, then render; or render as structured steps (preferred) |
| Redirect after payment | `redirect(query.returnUrl)` | Allow-list internal paths; reject absolute and `javascript:` URLs |
| External link from API (bank site) | `href = bank.url` | Validate `https:` scheme first; open with `rel="noopener noreferrer"` |
| Token storage | Access token in `localStorage` + logged on error | `httpOnly` cookie via server/BFF; never log tokens |
| Secret in client | Payment sandbox key in client env | Server-only env; client calls a server endpoint |
| Error display | Show `error.response.data` (stack trace, SQL message) | `AppError.message` from the central message map; details to observability |
| Input | Amount parsed with `parseInt(value)` only | Schema: number, integer, min/max, multiple of 1,000 |
| Route | `/topup/admin` hidden from menu only | Route guard + permission check; hiding is not authorization |
| Analytics event | `track('topup', { phone, email, amount })` | No PII: `track('topup_created', { amountBucket: '50k-100k' })` |
| Agent files / docs | Test account email + password in `AGENTS.md` | Credentials in a secret manager; docs say "ask the team lead for test credentials" |

## 2. Review checklist output

```markdown
Security review — ABC-482 top-up
- [x] HTML rendering: instructions rendered as steps, no raw HTML
- [x] Redirect: returnUrl checked against ALLOWED_RETURN_PATHS
- [x] Secrets: none added (grep for key/token/secret/password)
- [x] Errors: UI uses message map; backend message not shown
- [x] Routes: /topup guarded by `topup:create`
- [ ] Input: max amount not validated — max not defined by product (open question)
```
