# bp-second-brain — Examples

## 1. Deep note

```markdown
### Case-sensitive enum flag emptied the bank list
**Problem**: Bank list showed no banks for users whose banks were migrated last month.
**Root cause**: Backend sends `active: "y"` for migrated rows and `"Y"` for new ones; the mapper compared with `=== 'Y'`, so the domain rule filtered every migrated bank out.
**Fix / decision**: Normalize flags case-insensitively in the mapper (`bank.mapper.ts:14`):
`isActive: raw.active?.toUpperCase() === 'Y'`. Regression test added.
**Lesson**: Normalize every backend string flag/enum in the mapper; never compare raw transport values.
**Refs**: a1b2c3d, MR !41
**Tags**: enum-normalization, mapper
```

## 2. One-liner row

```markdown
| Date strings from the invoice API are UTC; format in the user's timezone in formatDateTime, never in the mapper | 9f8e7d6 | dates, timezone |
```

## 3. Filter decisions

| Commit | Include? | Reason |
|---|---|---|
| `fix: keep amount after bank refresh` (store re-created on refetch) | ✅ | Technical root cause (state lifetime) |
| `feat: add instructions page` | ❌ | Feature work |
| `style: update button padding` | ❌ | UI/style |
| `revert: switch back to cookie auth` with MR discussion | ✅ | Decision with rejected alternative |
| `ci: cache dependencies between jobs` | ✅ | Tooling/CI |

## 4. Promotion

The enum-normalization lesson appears a third time (invoice status, bank flag, payment method):

1. Add a mapper test helper / lint check, or a rule in `bp-api-integration` ("normalize every string enum/flag case-insensitively").
2. Mark the notes: `**Promoted**: bp-api-integration § Steps 3`.
3. Add a row to INDEX → Promoted lessons.
