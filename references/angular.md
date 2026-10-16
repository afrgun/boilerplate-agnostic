# Reference — Angular

> Dibaca oleh skill bila `stack-profile.md` → `stack: angular`. Susunan section sama dengan `react.md` dan `nextjs.md`.
> **Status: draf v0** — validasi dengan satu fitur contoh. Contoh memakai Angular modern (standalone component, `inject()`, signal, control flow `@if/@for/@switch`); untuk versi lama sesuaikan sintaks template.

## 1. Metode yang direkomendasikan

| Aspek | Pilihan | Alasan |
|---|---|---|
| Komponen | **Standalone**, `ChangeDetectionStrategy.OnPush` | Tanpa NgModule, performa lebih baik |
| DI | **DI bawaan Angular**; port = `abstract class` (langsung jadi token) | Tidak perlu container sendiri |
| Registrasi | **`providers` di route fitur** (`<feature>.routes.ts`), bukan satu `core.module.ts` | Fitur terisolasi, lazy |
| State | **Signal store per fitur** (`@Injectable` + `signal`/`computed`) | Ringan; alternatif NgRx SignalStore bila tim butuh struktur/devtools |
| Kontrak data | `Promise<Result<T, AppError>>` (via `firstValueFrom`) | Portable lintas stack. Alternatif: `Observable` bila banyak stream/SSE (lihat § 14) |
| HTTP | `HttpClient` + interceptor (auth, error) di `core/http` | Satu tempat token & normalisasi |
| Form | Reactive Forms (typed) | Validasi di boundary |
| Test | Runner sesuai Angular CLI versi terpilih (Jest/Vitest/Karma) + Testing Library Angular | Ikuti default CLI |

**Skill vendor (opsional)** — `web-design-guidelines` (Vercel) bersifat framework-agnostic dan bisa dipakai untuk review UI/a11y bersama `bp-ui-components`. Untuk praktik khusus Angular belum ada skill vendor yang direkomendasikan; acuan utama adalah dokumentasi resmi Angular. Bila tim menemukan skill tepercaya, daftarkan di sini dan di `stack-profile.md` § Vendor skills. Bila bertentangan dengan skill `bp-*`, skill `bp-*` yang berlaku.

## 2. Folder map

```
src/
├── app/                      # app.config.ts (provideHttpClient, interceptors, router), app.routes.ts
├── core/                     # http/, auth/, observability/ — infrastruktur lintas fitur (BUKAN domain)
├── shared/kernel/            # result.ts, app-error.ts — TS murni
├── shared/ui/                # atoms & molecules
└── features/<feature>/
    ├── domain/               # types + pure functions (no @angular/*, no rxjs)
    ├── application/          # ports (abstract class) + use cases (only when logic exists)
    ├── infrastructure/       # adapter (HttpClient), mapper, raw api types
    ├── presentation/         # store + components
    └── <feature>.routes.ts   # route + providers (the only place adapters are named)
```

## 3. Kernel

Sama dengan `react.md` § 3 (termasuk `shared/lib/format.ts` → `formatOrDash`, dipakai lewat pipe atau method komponen), tanpa `AppErrorException`/`unwrap` (tidak diperlukan karena store membaca `Result` langsung).

## 4. Domain

```ts
// features/topup/domain/bank.ts — no @angular/*, no rxjs
export interface Bank { readonly code: string; readonly name: string; readonly isActive: boolean; readonly isOtherBank: boolean }
export const selectableBanks = (banks: readonly Bank[]): Bank[] =>
  banks.filter((b) => b.isActive).sort((a, b) => Number(a.isOtherBank) - Number(b.isOtherBank));
```

## 5. Port

```ts
// features/topup/application/bank.repository.ts — abstract class = DI token
export abstract class BankRepository {
  abstract getBanks(): Promise<Result<Bank[], AppError>>;
}
```

## 6. Adapter + mapper

```ts
// features/topup/infrastructure/bank.mapper.ts — same as react.md § 6

// features/topup/infrastructure/http-bank.repository.ts
@Injectable()
export class HttpBankRepository extends BankRepository {
  private readonly http = inject(HttpClient);

  async getBanks(): Promise<Result<Bank[], AppError>> {
    try {
      const res = await firstValueFrom(this.http.get<{ data?: BankApiItem[] }>(API.topup.banks));
      const banks = toBanks(res?.data ?? []);                  // mapper: react.md § 6
      return banks ? ok(banks) : err({ type: 'server', message: 'Invalid bank data from server' });
    } catch (e) {
      return err(toAppError(e));   // single place: HTTP status / BE code → AppError
    }
  }
}
```

## 7. Use case (hanya bila ada logika)

```ts
// features/topup/application/create-topup.usecase.ts — plain class, no decorators
export class CreateTopupUseCase {
  constructor(private readonly topups: TopupRepository, private readonly banks: BankRepository) {}
  async execute(input: CreateTopupInput): Promise<Result<TopupInvoice, AppError>> {
    if (input.amount < MIN_TOPUP) return err({ type: 'validation', message: `Minimum top up is ${MIN_TOPUP}` });
    const banks = await this.banks.getBanks();
    if (!banks.ok) return banks;
    if (!banks.value.some((b) => b.code === input.bankCode && b.isActive)) {
      return err({ type: 'validation', message: 'Selected bank is not available' });
    }
    return this.topups.create(input);
  }
}
```

## 8. DI / composition root

`<feature>.routes.ts` adalah elemen lint **`app`** (composition root): satu-satunya file fitur yang boleh menyebut adapter, dan tidak boleh di-import oleh layer fitur mana pun. Angular tidak memakai elemen `di` — komponen/store mendapat port lewat `inject()`.

```ts
// features/topup/topup.routes.ts
export const TOPUP_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: BankRepository, useClass: HttpBankRepository },
      { provide: TopupRepository, useClass: HttpTopupRepository },
      { provide: CreateTopupUseCase, useFactory: (t: TopupRepository, b: BankRepository) => new CreateTopupUseCase(t, b), deps: [TopupRepository, BankRepository] },
      TopupStore,
    ],
    children: [{ path: 'banks', loadComponent: () => import('./presentation/bank-list.page').then((m) => m.BankListPage) }],
  },
];
```

## 9. State / store

```ts
// features/topup/presentation/topup.store.ts
type Status = 'idle' | 'loading' | 'ready' | 'error';

@Injectable()
export class TopupStore {
  private readonly bankRepository = inject(BankRepository);
  private readonly _banks = signal<Bank[]>([]);
  private readonly _status = signal<Status>('idle');
  private readonly _error = signal<AppError | null>(null);

  readonly banks = computed(() => selectableBanks(this._banks()));
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();

  async loadBanks(): Promise<void> {
    this._status.set('loading');
    const result = await this.bankRepository.getBanks();
    if (result.ok) { this._banks.set(result.value); this._status.set('ready'); }
    else { this._error.set(result.error); this._status.set('error'); }
  }
}
```

## 10. Komponen

```ts
@Component({
  standalone: true,
  selector: 'app-bank-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BankCardComponent, ErrorStateComponent, SkeletonComponent],
  template: `
    @switch (store.status()) {
      @case ('loading') { <app-skeleton /> }
      @case ('error') { <app-error-state [error]="store.error()" (retry)="store.loadBanks()" /> }
      @default { @for (bank of store.banks(); track bank.code) { <app-bank-card [bank]="bank" /> } }
    }
  `,
})
export class BankListPage implements OnInit {
  protected readonly store = inject(TopupStore);
  ngOnInit(): void { void this.store.loadBanks(); }
}
```

Komponen tidak menyuntik `HttpClient`, adapter, atau port secara langsung — hanya store.

## 11. Routing

`app.routes.ts` me-lazy-load `TOPUP_ROUTES` (`loadChildren`). Guard auth/role di `core/auth`.

## 12. Testing

| Target | Cara |
|---|---|
| domain, mapper, use case | unit test murni tanpa TestBed (wajib, test-first) |
| adapter | `provideHttpClientTesting()` + `HttpTestingController` → assert `Result` |
| store | TestBed dengan `{ provide: BankRepository, useValue: fake }` |
| komponen | Testing Library Angular, store fake |

## 13. Lint tambahan

`angular-eslint` (template & TS rules, termasuk aksesibilitas template), ditambah `<guideline>/lint/eslint.boundaries.mjs`. Domain: larang `@angular/*` dan `rxjs`.

## 14. Jebakan & keputusan

Alasan desain: pola Angular yang sering gagal adalah "clean di kerangka, tidak di isi" — port/adapter dan DI sudah benar, tetapi ratusan use case hanya meneruskan, aturan bisnis menumpuk di service `helpers` global dan komponen ribuan baris, entity menyalin JSON backend, dan semua provider didaftarkan di satu file. Reference ini mencegahnya dengan: aturan bisnis sebagai fungsi murni di `domain/`, mapper wajib, use case hanya bila ada logika, store per fitur, dan provider per route.

- **Jangan** `providedIn: 'root'` untuk adapter/store fitur — daftarkan di route fitur agar terisolasi.
- **Jangan** menaruh aturan bisnis di service `helpers` global; jadikan fungsi murni di `domain/`.
- Komponen raksasa (ribuan baris) adalah gejala store/domain yang hilang — pecah sejak awal.
- `Promise<Result>` vs `Observable`: pilih `Observable` hanya bila fitur butuh cancel/stream (SSE, polling, typeahead). Catat keputusan di `stack-profile.md`.
- `abstract class` vs `InjectionToken<Interface>`: default `abstract class`; pakai token bila butuh beberapa implementasi untuk satu interface.
