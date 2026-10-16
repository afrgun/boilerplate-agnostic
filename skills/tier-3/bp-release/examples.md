# bp-release — Examples

Assume profile: tag format `v<semver>` for production, `v<semver>-rc.<n>` for staging; commits follow `bp-git-workflow`.

## 1. Choosing the version

Last tag `v1.4.2`. Commits since then:

```
feat: [ABC-482] add top-up flow with bank list and instructions
fix: [ABC-490] keep amount when bank becomes unavailable
refactor: [ABC-501] extract bank card organism
chore: bump eslint to 9.39
```

| Change type present | Bump |
|---|---|
| Breaking change (removed route, changed public contract, `BREAKING CHANGE:` in body) | MAJOR → `v2.0.0` |
| At least one `feat` | **MINOR → `v1.5.0`** ← this case |
| Only `fix` / `refactor` / `chore` | PATCH → `v1.4.3` |

Staging first: `v1.5.0-rc.1`; production after sign-off: `v1.5.0`.

## 2. Changelog

```markdown
## v1.5.0 — 2026-10-20

### Features
- Top up balance: choose a bank, enter an amount, and get payment instructions (ABC-482)

### Fixes
- Entered amount is kept when the selected bank becomes unavailable (ABC-490)

### Internal
- Bank card extracted into a reusable component (ABC-501)
- ESLint updated to 9.39
```

User-facing wording; `chore`/`refactor` grouped under Internal (or omitted for external release notes).

## 3. Confirmation before tagging production

```markdown
Ready to release:
- Version: v1.5.0 (MINOR — 1 feature, 1 fix)
- From: main @ 7c1e2f4 (clean worktree, CI green, build ✅)
- Staging tag v1.5.0-rc.1 verified on 2026-10-19
- Will run: version bump commit "chore: release v1.5.0", annotated tag v1.5.0, push commit + tag

Proceed?
```

## 4. Not acceptable

| ❌ | Why |
|---|---|
| Moving existing tag `v1.5.0` to a newer commit "to include one more fix" | Tags are immutable references; release `v1.5.1` instead |
| Tagging from a branch with uncommitted changes | Tag does not match what was tested |
| Changelog = raw `git log` dump | Noise, internal ticket chatter, not user-facing |
| Production tag without explicit user confirmation | Irreversible, outward-facing action |
