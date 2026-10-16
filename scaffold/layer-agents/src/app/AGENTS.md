# src/app — Composition root

Lint element: `app`. Owning rules: skill `bp-architecture`, `references/<stack>.md` § 8 and § 11.

- Route files, app shell, providers, and global setup. Wires features together; contains no feature logic.
- May import every layer. **Nothing imports `app`.**
- Route/page files stay thin: render the feature's page/template and pass route params. Logic found here moves into the feature.
- New route → update `page-map.md` and check auth/permission + menu entries (`bp-conventions` done criteria).
