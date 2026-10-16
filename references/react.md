# Reference — React (SPA, Vite)

> Dibaca oleh skill bila `stack-profile.md` → `stack: react`. Susunan section sama di `nextjs.md` dan `angular.md` agar skill bisa merujuk "§ DI", "§ State", dst.
> **Status: draf v0** — validasi dengan satu fitur contoh sebelum dianggap final.

## 1. Metode yang direkomendasikan

| Aspek | Pilihan | Alasan |
|---|---|---|
| Build & routing | Vite + React Router (data router) | SPA standar, tanpa urusan server/client |
| Server state | **TanStack Query** | Cache, refetch, dedupe, loading/error gratis |
| Client/UI state | `useState` lokal; **Zustand** hanya untuk state lintas komponen non-server | Hindari store global untuk data server |
| Kontrak data | Port = `interface` + `Promise<Result<T, AppError>>` | Agnostic, mudah di-mock |
| DI | **Context composition root** (`AppProviders`) membuat adapter sekali; hook `usePorts()` | Tanpa library DI; test cukup ganti provider |
| HTTP | `fetch` atau axios dibungkus di `core/http` | Satu tempat untuk base URL, token, normalisasi error |
| Form | React Hook Form + skema (zod) | Validasi di boundary |
| Test | Vitest + Testing Library; MSW untuk HTTP | Cepat, standar ekosistem |

**Jembatan `Result` ↔ TanStack Query**: port tidak melempar, tetapi TanStack Query butuh lemparan untuk `isError`. Gunakan `unwrap()` di `queryFn`/`mutationFn` — **hanya di presentation**.

**Skill vendor (opsional)** — dipasang di samping skill `bp-*`, dicatat di `stack-profile.md` § Vendor skills:

| Skill | Penerbit | Fokus | Dipakai bersama |
|---|---|---|---|
| `vercel-react-best-practices` | Vercel (MIT) | Performa React: re-render, bundle, waterfall data | `bp-performance` |
| `vercel-composition-patterns` | Vercel (MIT) | Compound components, context provider, hindari boolean props | `bp-ui-components` |
| `web-design-guidelines` | Vercel | Review UI terhadap Web Interface Guidelines (a11y, UX) | `bp-ui-components`, subagent `ui-reviewer` |

Ambil dari sumber resmi penerbit dan catat sumber + versinya. Bila aturan skill vendor bertentangan dengan skill `bp-*`, skill `bp-*` yang berlaku (aturan proyek).

## 2. Folder map

```
src/
├── app/                      # composition root (lint element `app`): AppProviders, router, query client — nobody imports it
├── core/di/                  # lint element `di`: ports.ts (createPorts), ports-context.tsx (PortsProvider, usePorts) — presentation may import
├── core/http/                # http client, api-endpoints.ts, to-app-error.ts
├── shared/lib/               # pure cross-feature helpers: format.ts (formatOrDash), error-messages.ts (toUiError message map — not in core/, presentation cannot import core)
├── shared/kernel/            # result.ts, app-error.ts
├── shared/ui/                # atoms & molecules
└── features/<feature>/
    ├── domain/               # types + pure business rules
    ├── application/          # ports (interfaces) + use cases (only when logic exists)
    ├── infrastructure/       # http adapter, mapper, raw api types
    └── presentation/         # query hooks, components, pages
```

## 3. Kernel

```ts
// shared/kernel/result.ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// shared/kernel/app-error.ts
export type AppErrorType = 'unauthorized' | 'forbidden' | 'not_found' | 'validation' | 'conflict' | 'server' | 'network' | 'unknown';
export interface AppError { readonly type: AppErrorType; readonly message: string; readonly code?: string }

export class AppErrorException extends Error {
  constructor(readonly error: AppError) { super(error.message); }
}
export const unwrap = <T>(result: Result<T, AppError>): T => {
  if (!result.ok) throw new AppErrorException(result.error);
  return result.value;
};
```

```ts
// shared/lib/format.ts — the only way UI renders possibly-missing values (bp-ui-components rule 6)
const isMissing = (value: unknown): value is null | undefined | '' =>
  value === null || value === undefined || value === '' || (typeof value === 'number' && Number.isNaN(value));

export const formatOrDash = <T>(value: T | null | undefined, format?: (value: T) => string): string =>
  isMissing(value) ? '-' : format ? format(value as T) : String(value);
```

## 4. Domain

```ts
// features/topup/domain/bank.ts — plain types + pure functions, no React, no fetch
export interface Bank { readonly code: string; readonly name: string; readonly isActive: boolean; readonly isOtherBank: boolean }

export const selectableBanks = (banks: readonly Bank[]): Bank[] =>
  banks.filter((b) => b.isActive).sort((a, b) => Number(a.isOtherBank) - Number(b.isOtherBank));
```

## 5. Port

```ts
// features/topup/application/bank-repository.ts
import type { Result } from '@/shared/kernel/result';
import type { AppError } from '@/shared/kernel/app-error';
import type { Bank } from '../domain/bank';

export interface BankRepository {
  getBanks(): Promise<Result<Bank[], AppError>>;
}
```

## 6. Adapter + mapper

```ts
// features/topup/infrastructure/bank.mapper.ts
export interface BankApiItem { name?: string; desc?: string; isActive?: boolean; isOtherBank?: boolean }

// Required business field missing → null; never fabricate an id (bp-api-integration).
export const toBank = (api: BankApiItem): Bank | null => {
  if (!api.name) return null;
  return {
    code: api.name,
    name: api.desc ?? api.name,
    isActive: api.isActive ?? false,
    isOtherBank: api.isOtherBank ?? false,
  };
};

// All-or-nothing: one invalid item makes the whole response invalid.
export const toBanks = (items: readonly BankApiItem[]): Bank[] | null => {
  const banks = items.map(toBank);
  return banks.every((bank): bank is Bank => bank !== null) ? banks : null;
};

// features/topup/infrastructure/http-bank-repository.ts
import { http } from '@/core/http/http-client';          // returns Result, never throws
import { API } from '@/core/http/api-endpoints';
import { ok, err } from '@/shared/kernel/result';

export const createHttpBankRepository = (): BankRepository => ({
  async getBanks() {
    const res = await http.get<{ data?: BankApiItem[] }>(API.topup.banks);
    if (!res.ok) return res;
    const banks = toBanks(res.value.data ?? []);
    return banks ? ok(banks) : err({ type: 'server', message: 'Invalid bank data from server' });
  },
});
```

## 7. Use case (hanya bila ada logika)

```ts
// features/topup/application/create-topup.ts — validation across data before calling the port
export const createTopup = (deps: { topups: TopupRepository; banks: BankRepository }) =>
  async (input: CreateTopupInput): Promise<Result<TopupInvoice, AppError>> => {
    if (input.amount < MIN_TOPUP) return err({ type: 'validation', message: `Minimum top up is ${MIN_TOPUP}` });
    const banks = await deps.banks.getBanks();
    if (!banks.ok) return banks;
    if (!banks.value.some((b) => b.code === input.bankCode && b.isActive)) {
      return err({ type: 'validation', message: 'Selected bank is not available' });
    }
    return deps.topups.create(input);
  };
```

Bila use case hanya meneruskan ke port → **jangan dibuat**; hook memanggil port langsung.

## 8. DI / composition root

```tsx
// core/di/ports.ts — `di` may name adapters
export interface Ports { banks: BankRepository; topups: TopupRepository }
export const createPorts = (): Ports => ({ banks: createHttpBankRepository(), topups: createHttpTopupRepository() });

// core/di/ports-context.tsx — presentation hooks import usePorts from here
const PortsContext = createContext<Ports | null>(null);
export const PortsProvider = ({ ports, children }: { ports: Ports; children: ReactNode }) =>
  <PortsContext.Provider value={ports}>{children}</PortsContext.Provider>;
export const usePorts = (): Ports => {
  const ports = useContext(PortsContext);
  if (!ports) throw new Error('usePorts must be used inside <PortsProvider>');
  return ports;
};

// app/app-providers.tsx — composition root: the only place the ports object is instantiated
import { createPorts } from '@/core/di/ports';
import { PortsProvider } from '@/core/di/ports-context';

const ports = createPorts();
export const AppProviders = ({ children }: { children: ReactNode }) => (
  <PortsProvider ports={ports}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </PortsProvider>
);
```

Test: render dengan `<PortsProvider ports={{ banks: fakeBanks, ... }}>`.

## 9. State / presentation hook

```ts
// features/topup/presentation/use-banks.ts
export const bankKeys = { all: ['banks'] as const };

export const useBanks = () => {
  const { banks } = usePorts();
  return useQuery({
    queryKey: bankKeys.all,
    queryFn: async () => unwrap(await banks.getBanks()),
    select: selectableBanks,                      // domain rule, applied in presentation
  });
};

export const useCreateTopup = () => {
  const ports = usePorts();
  const run = useMemo(() => createTopup(ports), [ports]);
  return useMutation({ mutationFn: async (input: CreateTopupInput) => unwrap(await run(input)) });
};
```

Query key per fitur dalam satu objek factory (`bankKeys`), bukan array string acak.

## 10. Komponen

```tsx
// features/topup/presentation/bank-list-page.tsx — render only
export const BankListPage = () => {
  const { data, isPending, error, refetch } = useBanks();
  if (isPending) return <Skeleton />;
  if (error) return <ErrorState error={toUiError(error)} onRetry={refetch} />;
  return <BankList banks={data} />;
};
```

`toUiError` mengubah `AppErrorException` → judul/pesan dari peta pesan terpusat (lihat `bp-ui-components`).

## 11. Routing

Route didefinisikan di `app/router.tsx`; halaman fitur di-lazy-load (`lazy: () => import(...)`). Halaman hanya merangkai komponen fitur.

## 12. Testing

| Target | Cara |
|---|---|
| domain, mapper | unit test murni (wajib, test-first) |
| adapter | MSW atau fake `http` → assert `Result` ok/err |
| use case | fake port (objek literal) |
| hook | `renderHook` + `PortsProvider` fake + `QueryClientProvider` baru per test |
| komponen | Testing Library, assert perilaku yang terlihat user |

## 13. Lint tambahan

`eslint-plugin-react-hooks` (rules-of-hooks, exhaustive-deps), `eslint-plugin-jsx-a11y`, ditambah `<guideline>/lint/eslint.boundaries.mjs`.

## 14. Jebakan

- Jangan simpan data server di Zustand/Context — duplikasi cache TanStack Query.
- Jangan panggil `unwrap` di adapter atau use case; `Result` harus utuh sampai presentation.
- Jangan membuat adapter di dalam komponen (`createHttpBankRepository()` di render) — hanya di composition root.
- Buat `QueryClient` baru per test agar cache tidak bocor antar test.
