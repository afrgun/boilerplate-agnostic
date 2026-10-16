# Page Map

Agent lookup table: resolve vague UI terms in a prompt ("bug in the work type page", "redirect after save in sprint detail") to files **before** any broad search, then read only the mapped files.

- Path prefix: `src/` = repo `src/`.
- Routes are defined in: `<fill: router file / app folder>`.
- Data flow for a mapped area: page → presentation store/hook → application port/use case → infrastructure adapter → mapper.

**Maintenance rule:** if a prompt resolves to files that are not in this table, or an entry is stale, update this file in the same change — including the alias the user actually typed — so the next session starts from the corrected mapping.

## <Feature or area name>

| Term (raw-prompt aliases) | Route | Entry point | Also see |
|---|---|---|---|
| <term>, <alias>, <alias> | `/<route>` | `src/features/<feature>/presentation/<page-file>` | store: `.../presentation/<store>`; port: `.../application/<port>`; adapter: `.../infrastructure/<adapter>`; mapper: `.../infrastructure/<mapper>` |

## Navigation & redirect hotspots

| Situation | File | Note |
|---|---|---|
| <e.g. redirect after create> | `<file>` | <why it matters> |
