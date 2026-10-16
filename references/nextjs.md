# Reference — Next.js (App Router)

> Dibaca oleh skill bila `stack-profile.md` → `stack: nextjs`. Susunan section sama dengan `react.md` dan `angular.md`.
> **Status: tervalidasi** dengan template `fe-starter-nextjs` (Next.js 16.4, React 19.3, Cache Components aktif): lint + boundaries, typecheck, 38 test, build mock & HTTP lolos. Contoh kode di bawah diambil dari template itu. Next.js berubah cepat — bila versi di `stack-profile.md` berbeda, baca `node_modules/next/dist/docs/` lebih dulu.

## 1. Metode yang direkomendasikan

| Aspek | Pilihan | Alasan |
|---|---|---|
| Router | **App Router** dengan **Cache Components** (default `create-next-app` sejak Next 16) | Static shell + streaming per request |
| Data awal halaman | **Server Component** memanggil port lewat `createServerPorts()`, **dibungkus `<Suspense>`** di route | Wajib di Cache Components untuk data per request; token tetap di server |
| Mutasi | **Server Action** dengan signature `(prevState, formData)` + **`useActionState`** di client | Pola resmi form Next 16; state hasilnya bisa diserialisasi |
| Interaksi client lain | TanStack Query hanya bila butuh fetch dari browser (polling, infinite list) | Jangan menambah library untuk form biasa |
| Kontrak data | Port = `interface` + `Promise<Result<T, AppError>>` | Sama dengan React & Angular |
| Domain | **Tipe plain + fungsi murni**; tanggal sebagai string ISO | Data Server → Client harus bisa diserialisasi |
| DI | **Server: factory per request** (`createServerPorts()`), mock/HTTP dipilih lewat env | Singleton di server membocorkan data antar user |
| Auth/token | Cookie `httpOnly`, dibaca `server-http` lewat `cookies()` | Token tidak pernah masuk bundle client |
| Proteksi import | `server-only` di modul server; `"use client"` hanya di komponen interaktif; lint client/server (§ 13) | Kode/secret server tidak ter-bundle |
| UI kit | shadcn/ui dengan alias ke `src/shared/ui` | Atom siap pakai, kode milik repo |
| Test | Vitest (env `node` default, `jsdom` per file komponen) + Testing Library | Cepat; Server Component async diuji lewat e2e |

**Skill vendor (opsional)** — sama dengan `react.md` § 1 (`vercel-react-best-practices` mencakup Server Components, fetching di server, dan bundle Next.js; `vercel-composition-patterns`; `web-design-guidelines`). Catat di `stack-profile.md` § Vendor skills. Bila bertentangan dengan skill `bp-*`, skill `bp-*` yang berlaku.

## 2. Folder map

```
src/
├── app/                          # lint `app` (composition root): page.tsx/layout.tsx tipis — nobody imports it
├── proxy.ts                      # (opsional) pengganti middleware.ts sejak Next 16 — lint `app`
├── core/http/                    # server-http.ts (server-only), api-endpoints.ts, to-app-error.ts
├── core/di/                      # lint `di`: server-ports.ts (server-only) — presentation MAY import
├── shared/kernel/                # result.ts, app-error.ts (isomorphic)
├── shared/lib/                   # format.ts (formatOrDash), error-messages.ts (message map), utils.ts (cn)
├── shared/ui/                    # atom shadcn + EmptyState/ErrorState
└── features/<feature>/
    ├── domain/                   # plain types + pure functions (isomorphic)
    ├── application/              # ports + use cases (isomorphic, no next/* imports)
    ├── infrastructure/           # mapper, constants (kode bisnis), mock adapter; server/ = adapter HTTP server-only
    └── presentation/             # server/ (RSC sections), client/ (komponen interaktif), actions.ts, <x>-form-state.ts
test/                             # setup Vitest + stub server-only (di luar src/ agar lolos no-unknown-files)
```

Message map ada di `shared/lib` (bukan `core/`), karena presentation tidak boleh meng-import `core`.

## 3. Kernel

Sama dengan `react.md` § 3 (`Result`, `ok`, `err`, `AppError`, `AppErrorException`, `unwrap`, dan `shared/lib/format.ts` → `formatOrDash`). File kernel & shared/lib **isomorphic**: tanpa `server-only`, tanpa `"use client"`.

```ts
// shared/lib/error-messages.ts — central message map (bp-ui-components rule 7)
export const toUiError = (error: AppError): UiError => {
  const base = MESSAGES[error.type];                       // Record<AppErrorType, { title, message }>
  const showOwnMessage = (error.type === 'validation' || error.type === 'conflict') && error.message.length > 0;
  return showOwnMessage ? { title: base.title, message: error.message } : base;
};
```

## 4. Domain

```ts
// features/topup/domain/topup.ts — rules + serializable types
export const MIN_TOPUP = 10_000;
export interface TopupInvoice { readonly id: string; readonly amount: number; readonly virtualAccount: string; readonly expiresAt: string /* ISO */ }
export const validateAmount = (amount: number): AppError | null => {
  if (!Number.isInteger(amount)) return { type: 'validation', message: 'Amount must be a whole number' };
  if (amount < MIN_TOPUP) return { type: 'validation', message: 'Minimum top up is 10,000' };
  if (amount % 1_000 !== 0) return { type: 'validation', message: 'Amount must be a multiple of 1,000' };
  return null;
};
```

`Bank` + `selectableBanks`: sama dengan `react.md` § 4.

## 5. Port

```ts
// features/topup/application/bank-repository.ts
export interface BankRepository {
  getBanks(): Promise<Result<Bank[], AppError>>;
}
```

## 6. Adapter + mapper

```ts
// core/http/server-http.ts — never throws; returns the raw envelope or an HttpFailure
export interface HttpClient {
  get<T>(path: string): Promise<Result<Envelope<T>, HttpFailure>>;
  post<T>(path: string, body: unknown): Promise<Result<Envelope<T>, HttpFailure>>;
}
const request = async <T>(path: string, init: RequestInit) => {
  // Read request data FIRST so the route stays dynamic — an early return before this lets the
  // build prerender and freeze an error page (see § 14).
  const token = (await cookies()).get('access_token')?.value;
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) return err({ status: 500 });
  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, cache: 'no-store', headers: { /* json + bearer */ } });
    const body = (await response.json().catch(() => null)) as Envelope<T> | null;
    if (!response.ok) return err({ status: response.status, code: body?.status?.code });
    return ok(body ?? {});
  } catch {
    return err({ network: true });
  }
};
```

```ts
// features/topup/infrastructure/server/http-bank-repository.ts
import 'server-only';

export const createHttpBankRepository = (http: HttpClient = serverHttp()): BankRepository => ({
  async getBanks() {
    const response = await http.get<BankApiItem[]>(API.topup.banks);
    if (!response.ok) return err(toAppError(response.error, TOPUP_ERROR_TYPES));     // HTTP/network failure

    const { status, data } = response.value;
    if (status?.code !== TOPUP_SUCCESS.OK) return err(toAppError({ status: 200, code: status?.code }, TOPUP_ERROR_TYPES));

    const banks = toBanks(data ?? []);                                                // mapper: react.md § 6
    return banks ? ok(banks) : err({ type: 'server', message: 'Invalid bank data from server' });
  },
});
```

`toAppError(failure, businessCodes)` ada di `core/http`; peta kode bisnis (`TOPUP_ERROR_TYPES`, `TOPUP_SUCCESS`) ada di `infrastructure/<feature>.constants.ts` dan dioper sebagai parameter (core tidak meng-import fitur).

**Mock adapter** memakai data mentah dengan bentuk yang sama dan melewati **mapper yang sama**, sehingga jalur mock dan HTTP berperilaku identik.

## 7. Use case (hanya bila ada logika)

Sama dengan `react.md` § 7 — fungsi factory murni, tanpa import `next/*`, dipanggil dari Server Action maupun Server Component.

## 8. DI / composition root

```ts
// core/di/server-ports.ts — factory per request, NEVER a module-level singleton holding user data
import 'server-only';

const isMockEnabled = (): boolean => process.env.NEXT_PUBLIC_USE_MOCK === 'true';   // not `useMock` — see § 14

export const createServerPorts = (): ServerPorts =>
  isMockEnabled()
    ? { banks: createMockBankRepository(), topups: createMockTopupRepository() }
    : { banks: createHttpBankRepository(), topups: createHttpTopupRepository() };
```

Client-side DI (`core/di/client-ports-context.tsx`, bentuk sama dengan `react.md` § 8) **hanya dibuat bila ada adapter yang berjalan di browser**. Form yang memakai Server Action tidak membutuhkannya.

## 9. State / presentation

```tsx
// app/topup/page.tsx — route file stays thin; <Suspense> is required for per-request data
export default function TopupPage() {
  return (
    <main>
      <h1>Top up</h1>
      <Suspense fallback={<BanksSkeleton />}>
        <BanksSection />
      </Suspense>
    </main>
  );
}

// features/topup/presentation/server/banks-section.tsx — Server Component
export async function BanksSection() {
  const result = await createServerPorts().banks.getBanks();
  if (!result.ok) return <ErrorState error={toUiError(result.error)} />;
  const banks = selectableBanks(result.value);
  if (banks.length === 0) return <EmptyState title="No banks available" description="Please try again later." />;
  return <TopupForm banks={banks} action={createTopupAction} />;     // action passed as a prop → testable
}
```

```ts
// features/topup/presentation/topup-form-state.ts — serializable, shared by action and form
export type TopupFormState =
  | { status: 'idle' }
  | { status: 'error'; error: AppError; values: { bankCode: string; amount: string } }
  | { status: 'success'; invoice: TopupInvoice };

// features/topup/presentation/actions.ts
'use server';
export async function createTopupAction(_previous: TopupFormState, formData: FormData): Promise<TopupFormState> {
  // Server Functions are reachable by direct POST: verify session/permission here when auth exists.
  const bankCode = String(formData.get('bankCode') ?? '').trim();
  const amountText = String(formData.get('amount') ?? '').trim();
  const values = { bankCode, amount: amountText };
  if (!bankCode) return { status: 'error', error: { type: 'validation', message: 'Choose a bank' }, values };
  const amount = Number(amountText);
  if (amountText === '' || !Number.isFinite(amount)) return { status: 'error', error: { type: 'validation', message: 'Enter an amount' }, values };
  const result = await createTopup(createServerPorts())({ bankCode, amount });
  return result.ok ? { status: 'success', invoice: result.value } : { status: 'error', error: result.error, values };
}
```

```tsx
// features/topup/presentation/client/topup-form.tsx
'use client';
export function TopupForm({ banks, action }: TopupFormProps) {
  const [state, formAction, pending] = useActionState(action, initialTopupFormState);
  if (state.status === 'success') return <InvoiceCard invoice={state.invoice} />;   // values via formatOrDash
  return (
    <form action={formAction}>
      <RadioGroup name="bankCode" defaultValue={state.status === 'error' ? state.values.bankCode : undefined}>
        {banks.map((bank) => <Label key={bank.code}><RadioGroupItem value={bank.code} />{formatOrDash(bank.name)}</Label>)}
      </RadioGroup>
      <Input name="amount" type="number" /* … */ />
      {state.status === 'error' && <ErrorState error={toUiError(state.error)} />}
      <Button type="submit" disabled={pending}>Top up</Button>
    </form>
  );
}
```

## 10. Komponen

- Server Component: ambil data lewat port, tangani `Result`, kirim **data plain** (dan Server Action sebagai prop) ke client component.
- Client Component: interaksi saja; tidak meng-import modul server (dipaksa lint § 13).
- Skeleton via `<Suspense fallback>`; `loading.tsx` / `error.tsx` per segmen bila perlu.
- Link bergaya tombol: `<Link className={buttonVariants()}>` — jangan membungkus `<a>` di dalam `Button`.

## 11. Routing

`src/app/**` hanya berisi file route tipis yang merangkai fitur. Middleware sejak Next 16 bernama **`proxy.ts`**. Logika tidak ditulis di `app/`.

## 12. Testing

| Target | Cara |
|---|---|
| domain, mapper, use case, `formatOrDash` | unit test murni (wajib, test-first), env `node` |
| adapter server | inject `HttpClient` palsu: `{ get: async () => response as never, post: … }` → assert `Result` (sukses, kode bisnis error, HTTP error, network, payload invalid) |
| Server Action | uji use case-nya; action cukup tipis |
| client component | `/** @vitest-environment jsdom */` di baris pertama; render dengan `action` palsu yang mengembalikan state error/sukses |
| Server Component async & alur penuh | e2e (Playwright) atau `next start` + request HTTP |

```ts
// vitest.config.mts
export default defineConfig({
  resolve: { alias: { '@': fromRoot('./src'), 'server-only': fromRoot('./test/server-only-stub.ts') } },
  test: { environment: 'node', setupFiles: ['./test/setup.ts'], include: ['src/**/*.test.{ts,tsx}'] },
});
```

## 13. Lint tambahan

`eslint-config-next` (core-web-vitals + typescript) ditambah `<guideline>/lint/eslint.boundaries.mjs`, plus aturan client/server:

```js
{
  files: ['src/features/*/presentation/client/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{
      group: ['**/server/**', '@/core/di/server-ports', '@/core/http/server-http', '**/infrastructure/**', 'axios'],
      message: 'Client components must not import server-only modules or adapters.',
    }] }],
  },
},
// and add "guideline/**" to globalIgnores — the pack is docs + tooling, not app source
```

## 14. Jebakan & keputusan

- **Cache Components**: data per request (fetch tanpa cache, `cookies()`, `headers()`) **wajib** di dalam `<Suspense>`; tanpa itu build/dev menandai *blocking route*.
- **Halaman error "beku" saat build**: bila fungsi server `return` lebih awal (mis. env `API_BASE_URL` belum ada) **sebelum** membaca data request, Next menganggap route statis dan mem-prerender error itu ke hasil build. Baca `cookies()`/`headers()` lebih dulu (atau `await connection()`), baru cek env. Terverifikasi: route berubah dari `○ Static` ke `◐ Partial Prerender`.
- **Singleton di server** (store, cache, instance di level modul) dipakai bersama antar request → data user bocor. Selalu factory per request.
- **Class domain dengan method / `Date`** dikirim ke Client Component → hilang/berubah saat serialisasi. Pakai tipe plain dan string ISO.
- **Server Action bisa dipanggil lewat POST langsung** — verifikasi sesi & izin di dalam action, bukan hanya di UI.
- **Nama fungsi biasa diawali `use`** (mis. `useMock`) ditolak `react-hooks/rules-of-hooks`. Hanya hook yang boleh diawali `use`.
- **shadcn/ui**: arahkan `aliases` di `components.json` ke `@/shared/ui` & `@/shared/lib/utils`. Versi baru memakai paket npm `cn` (pengganti `clsx` + `tailwind-merge`) — boleh di-import lewat `@/shared/lib/utils` agar satu sumber.
- **npm 10** bisa gagal memasang `vitest` dengan `Cannot read properties of null (reading 'edgesOut')` (bug peer-set). Pakai `npx npm@11 install <pkg>`, dan pilih `vitest@^4` bila `@types/node` masih `^20`.
- Secret/env server (tanpa `NEXT_PUBLIC_`) jangan dipakai di file `"use client"`.
