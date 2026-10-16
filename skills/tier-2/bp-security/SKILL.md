---
name: bp-security
description: Use when touching authentication, tokens, cookies, user input, rendering HTML or URLs, file upload/download, error display, environment variables, or anything that could leak data — applies OWASP Top 10 to frontend code.
---

# Frontend Security (OWASP)

## Rules

| Area | Rule |
|---|---|
| **XSS** | Never render untrusted HTML. If HTML must be rendered, sanitize with the project's sanitizer in one shared helper. No `innerHTML`/`dangerouslySetInnerHTML`/`[innerHTML]` with raw data. |
| **URLs** | Validate user/API-provided URLs before use in `href`/`src`/redirects; allow only `https:`/relative; block `javascript:`. Open redirects: redirect only to allow-listed internal paths. |
| **Tokens** | Prefer `httpOnly` cookies managed by server/BFF. If tokens must live client-side, keep them in memory or the agreed storage, never in URLs or logs. |
| **Secrets** | No API keys, credentials, or private URLs in client code, repo files, or agent files. Only variables explicitly meant to be public reach the browser bundle. |
| **Errors** | Show user-facing messages from the central message map; never render stack traces, raw backend errors, or internal IDs. Log details to observability, not to the UI. |
| **Input** | Validate at the boundary (forms, server actions, route handlers) with a schema; length and type limits on every field. |
| **Uploads** | Check type and size client-side for UX, but treat server validation as the authority. |
| **Downloads** | Use filenames from trusted headers/mappers; sanitize before saving. |
| **Auth flows** | Route guards and permission checks for every protected route; hide *and* protect (UI hiding is not authorization). |
| **Dependencies** | No new dependency without checking maintenance status; keep lockfile committed. |
| **CSRF** | Cookie-authenticated mutations use the framework/BFF CSRF protection or same-site cookies. |
| **Logging** | No PII, tokens, or passwords in `console`/analytics events. |

## Review checklist (run on every security-relevant diff)

- [ ] Any new HTML rendering path sanitized?
- [ ] Any new redirect or external URL validated?
- [ ] Any secret, token, or credential added to code, config, docs, or agent files?
- [ ] Any error shown to the user that contains backend internals?
- [ ] Any new route without guard/permission?
- [ ] Any new input without schema validation?

Report unchecked items explicitly instead of assuming they are fine.

## Examples

Worked examples (fictional `topup` feature): `examples.md` in this skill folder. Read it when the rules above leave a placement or format decision unclear.
