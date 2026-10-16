# Reference — Next.js (App Router)

> Dibaca oleh skill bila `stack-profile.md` → `stack: nextjs`. Susunan section sama dengan `react.md` dan `angular.md`.
> **Status: draf v0** — validasi dengan satu fitur contoh sebelum dianggap final. Perilaku caching `fetch` dan beberapa API berbeda antar versi Next.js — cek dokumentasi versi yang tercatat di `stack-profile.md`.

## 1. Metode yang direkomendasikan

| Aspek | Pilihan | Alasan |
|---|---|---|
| Router | **App Router** | Server Components untuk fetch awal, streaming |
| Data awal halaman | **Server Component** memanggil use case/port di server | Tanpa waterfall client, token tetap di server |
| Mutasi | **Server Action** (atau Route Handler bila dipakai klien lain) memanggil use case | Satu boundary untuk validasi & auth |
| Interaksi client | TanStack Query di client component, memanggil Route Handler / Server Action | Cache & refetch di sisi browser |
| Kontrak data | Port = `interface` + `Promise<Result<T, AppError>>` | Sama dengan React & Angular |
| Domain | **Tipe plain + fungsi murni** (bukan class dengan method) | Data dari Server → Client Component harus bisa diserialisasi; method class hilang |
| DI | **Server: factory per request** (`createServerPorts()`); **Client: context provider** | Singleton di server bisa membocorkan data user A ke user B |
| Auth/token | Cookie `httpOnly`, dibaca adapter server lewat `cookies()` | Token tidak pernah masuk bundle/JS client |
| Proteksi import | Paket `server-only` di modul server; `"use client"` hanya di komponen interaktif | Mencegah kode/secret server ter-bundle ke client |
| Test | Vitest + Testing Library (+ MSW); Playwright untuk e2e | Server Component async paling aman diuji lewat e2e |

**Skill vendor (opsional)** — sama dengan `react.md` § 1 (`vercel-react-best-practices` mencakup Server Components, fetching di server, dan bundle Next.js; `vercel-composition-patterns`; `web-design-guidelines`). Catat di `stack-profile.md` § Vendor skills. Bila bertentangan dengan skill `bp-*`, skill `bp-*` yang berlaku.

## 2. Folder map

```
src/
├── app/                          # lint element `app` (composition root): page.tsx, layout.tsx, route.ts — nobody imports it
├── core/http/                    # server-http.ts (server-only), client-http.ts, api-endpoints.ts, to-app-error.ts
├── core/di/                      # lint element `di`: server-ports.ts (server-only), client-ports-context.tsx — presentation MAY import
├── shared/kernel/                # result.ts, app-error.ts (isomorphic)
├── shared/lib/                   # pure cross-feature helpers (formatOrDash, ...)
├── shared/ui/                    # atoms & molecules
└── features/<feature>/
    ├── domain/                   # plain types + pure functions (isomorphic)
    ├── application/              # ports + use cases (isomorphic, no next/* imports)
    ├── infrastructure/           # adapters (server/ dan client/ bila beda), mapper, raw types
    └── presentation/             # server/ (RSC sections), client/ (interactive components, hooks)
```

## 3. Kernel

Sama dengan `react.md` § 3 (`Result`, `ok`, `err`, `AppError`, `AppErrorException`, `unwrap`, dan `shared/lib/format.ts` → `formatOrDash`). File kernel & shared/lib **isomorphic**: tanpa `server-only`, tanpa `"use client"`.

## 4. Domain

```ts
// features/topup/domain/bank.ts — serializable plain data + pure functions
export interface Bank { readonly code: string; readonly name: string; readonly isActive: boolean; readonly isOtherBank: boolean }
export const selectableBanks = (banks: readonly Bank[]): Bank[] =>
  banks.filter((b) => b.isActive).sort((a, b) => Number(a.isOtherBank) - Number(b.isOtherBank));
```

## 5. Port

```ts
// features/topup/application/bank-repository.ts
export interface BankRepository {
  getBanks(): Promise<Result<Bank[], AppError>>;
}
```

## 6. Adapter + mapper

```ts
// features/topup/infrastructure/bank.mapper.ts — same as react.md § 6

// features/topup/infrastructure/server/http-bank-repository.ts
import 'server-only';
import { serverHttp } from '@/core/http/server-http';   // reads cookies(), returns Result, never throws
import { API } from '@/core/http/api-endpoints';

export const createHttpBankRepository = (http = serverHttp()): BankRepository => ({
  async getBanks() {
    const res = await http.get<{ data?: BankApiItem[] }>(API.topup.banks, { cache: 'no-store' }); // set caching explicitly
    if (!res.ok) return res;
    return ok((res.value.data ?? []).map(toBank));
  },
});
```

Bila client juga perlu memanggil API langsung (bukan lewat Route Handler), buat adapter terpisah di `infrastructure/client/` dengan `client-http.ts`.

## 7. Use case (hanya bila ada logika)

Sama dengan `react.md` § 7 — fungsi factory murni, tanpa import `next/*`, sehingga bisa dipanggil dari Server Component, Server Action, maupun Route Handler.

## 8. DI / composition root

```ts
// core/di/server-ports.ts — factory per request, NEVER a module-level singleton holding user data
import 'server-only';
export interface ServerPorts { banks: BankRepository; topups: TopupRepository }
export const createServerPorts = (): ServerPorts => ({
  banks: createHttpBankRepository(),
  topups: createHttpTopupRepository(),
});
```

```tsx
// core/di/client-ports-context.tsx
'use client';
// Same shape as react.md § 8 (PortsProvider + usePorts), holding client-side adapters only.
```

## 9. State / presentation

```tsx
// app/(dashboard)/topup/banks/page.tsx — route file stays thin
import { BanksSection } from '@/features/topup/presentation/server/banks-section';
export default function Page() { return <BanksSection />; }

// features/topup/presentation/server/banks-section.tsx — Server Component
export async function BanksSection() {
  const result = await createServerPorts().banks.getBanks();
  if (!result.ok) return <ErrorState error={toUiError(result.error)} />;
  return <BankPicker banks={selectableBanks(result.value)} />;   // plain data → serializable
}
```

```ts
// features/topup/presentation/actions.ts — Server Action
'use server';
export async function createTopupAction(input: CreateTopupInput): Promise<Result<TopupInvoice, AppError>> {
  const parsed = createTopupSchema.safeParse(input);               // validate at the boundary
  if (!parsed.success) return err({ type: 'validation', message: 'Invalid top up data' });
  return createTopup(createServerPorts())(parsed.data);           // Result is serializable
}
```

```tsx
// features/topup/presentation/client/bank-picker.tsx
'use client';
export function BankPicker({ banks }: { banks: Bank[] }) {
  const mutation = useMutation({ mutationFn: async (i: CreateTopupInput) => unwrap(await createTopupAction(i)) });
  // render atoms only
}
```

## 10. Komponen

- Server Component: ambil data, tangani `Result`, kirim **data plain** ke client component.
- Client Component: interaksi saja; tidak meng-import modul `server-only`.
- `loading.tsx` / `error.tsx` per segmen route untuk skeleton & error boundary.

## 11. Routing

`src/app/**` hanya berisi file route tipis (page/layout/route/actions) yang memanggil fitur. Logika tidak ditulis di `app/`.

## 12. Testing

| Target | Cara |
|---|---|
| domain, mapper, use case | unit test murni (wajib, test-first) |
| adapter server | fake `serverHttp` → assert `Result` |
| Server Action | panggil fungsi langsung dengan fake ports (inject lewat parameter atau modul mock) |
| client component | Testing Library + `PortsProvider` fake |
| Server Component async & alur penuh | Playwright e2e |

## 13. Lint tambahan

`eslint-config-next` (core-web-vitals), `eslint-plugin-jsx-a11y`, ditambah `<guideline>/lint/eslint.boundaries.mjs`. Tambahkan `no-restricted-imports` agar `presentation/client/**` tidak meng-import `**/server/**` dan `core/di/server-ports`.

## 14. Jebakan

- **Singleton di server** (store, cache, instance PLOC di level modul) dipakai bersama antar request → data user bocor. Selalu factory per request.
- **Class domain dengan method** dikirim ke Client Component → method hilang saat serialisasi. Pakai tipe plain + fungsi murni.
- **Secret/env server** (`process.env.X` tanpa `NEXT_PUBLIC_`) jangan dipakai di file `"use client"`.
- **Caching `fetch`** default berbeda antar versi Next.js — selalu set eksplisit (`cache`, `next.revalidate`) di adapter.
- Jangan menaruh logika fitur di `app/**/page.tsx`; route hanya merangkai.
