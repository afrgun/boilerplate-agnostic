# <Feature> — API contract

| Key | Value |
|---|---|
| Base path | `/<service>/v1` |
| Auth | `<bearer token / cookie / none>` |
| Envelope | `{ status: { code, message }, data, meta, error }` (adjust) |
| Success codes | HTTP `200`/`201`; business `<e.g. ABC20000>` |

## <METHOD> `<path>` — <purpose>

**Query / path params**

| Name | Type | Required | Notes |
|---|---|---|---|
| `page` | number | no | 1-based |

**Request body** (writes only)

```json
{ }
```

**Response sample (success)**

```json
{ }
```

**Field notes** — guaranteed vs optional, formats, enums

| Field | Type | Always present? | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `status` | string | yes | enum: `draft`, `live`, `finish` (backend may send `FINISHED`) |
| `createdAt` | string | yes | ISO 8601 |

**Errors**

| HTTP | Business code | Meaning | UI behavior |
|---|---|---|---|
| 400 | `<ABC40001>` | <validation> | show field errors |
| 404 | `<ABC40401>` | <not found> | empty/not-found state |
| 409 | `<ABC40901>` | <conflict, e.g. slot full> | toast + keep form |
