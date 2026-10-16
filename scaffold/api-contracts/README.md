# API Contracts

Single place where backend contracts for this project live. Skill `bp-api-integration` reads from here before writing endpoints, raw types, mappers, or adapters.

## Rules

1. **One file per feature**: `<feature>.md` (copy `_template.md`), or the backend's OpenAPI file as `<feature>.openapi.yaml` / `.json`.
2. **Real samples over prose**: paste an actual response (with personal data removed) for every endpoint.
3. **Success and error codes are mandatory**: HTTP status plus backend business codes, each with its meaning.
4. **Never store secrets**: no tokens, cookies, API keys, or real customer data in samples.
5. **Keep it current**: a contract change updates this folder in the same change as the adapter/mapper.

## Index

| Feature | File | Backend source / owner | Last verified |
|---|---|---|---|
| `<feature>` | `<feature>.md` | `<link or team>` | `<YYYY-MM-DD>` |
