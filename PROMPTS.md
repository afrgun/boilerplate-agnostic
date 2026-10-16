# Cheat Sheet Prompt untuk Tim

Contoh kalimat untuk memulai pekerjaan dengan AI agent di repo yang memakai paket ini. Tidak wajib persis sama — yang penting **menyebut tujuan, konteks (tiket/kontrak/desain), dan batasan**. Agent akan memilih skill dari tabel routing di `AGENTS.md`; kolom "Skill" di bawah hanya untuk informasi.

> Sebelum mulai di project baru: pastikan `guideline/stack-profile.md` sudah terisi. Tanpa itu agent akan berhenti dan bertanya (atau, di mode lomba, membuat asumsi).

## Memulai & orientasi

| Kebutuhan | Contoh prompt | Skill |
|---|---|---|
| Menyiapkan project baru | "Baca `guideline/README.md`, bantu adopsi paket ini ke repo ini: isi `stack-profile.md` untuk **Next.js**, salin scaffold, sync skill, pasang lint." | — |
| Orientasi area kode | "Halaman **top up** ada di file mana saja? Pakai `page-map.md` dulu." | AGENTS § Navigation |
| Ganti ke mode lomba | "Set `mode: competition` di stack profile. Timebox 6 jam, catat asumsi di `ASSUMPTIONS.md`." | `bp-competition-mode` |

## Membangun fitur

| Kebutuhan | Contoh prompt | Skill |
|---|---|---|
| Fitur end-to-end | "Bangun fitur **top up** dari tiket ABC-482: user pilih bank, isi nominal, dapat instruksi bayar. Kontrak di `api-contracts/topup.md`. Mulai dari fase 0." | `bp-feature-lifecycle` |
| Rencana saja (dry run) | "Scaffold fitur **top up**, plan only — buat spec dan daftar file, jangan implementasi." | `bp-feature-lifecycle` |
| Satu fase tertentu | "Lanjut **fase 5** (infrastructure) untuk top up." | `bp-feature-lifecycle` |
| Integrasi endpoint | "Integrasikan `GET /topup/v1/banks`. Ini contoh responsnya: `<tempel JSON>`. Simpan dulu ke `api-contracts/`." | `bp-api-integration` |
| Dari desain Figma | "Implementasikan frame ini `<link Figma>` untuk halaman pilih bank. Klasifikasikan surface-nya dulu." | `bp-figma-to-code` |
| Komponen UI | "Buat atom **SegmentedControl** di shared UI untuk pilihan nominal cepat, lalu pakai di form top up." | `bp-ui-components` |

## Kualitas & review

| Kebutuhan | Contoh prompt | Skill / subagent |
|---|---|---|
| Tulis test | "Tulis test untuk `validateAmount` dan mapper bank, test-first." | `bp-testing` |
| Review arsitektur | "Review perubahan di branch ini terhadap aturan layer." | subagent `architecture-reviewer` |
| Review UI | "Review halaman top up: atom, state kosong/error, aksesibilitas." | subagent `ui-reviewer` |
| Review keamanan | "Cek perubahan ini dengan checklist keamanan." | `bp-security` |
| Cek selesai | "Jalankan done criteria dan laporkan hasil command-nya." | `bp-conventions` |

## Bug, performa, legacy

| Kebutuhan | Contoh prompt | Skill |
|---|---|---|
| Debug | "Daftar bank kosong untuk sebagian user. Cari root cause dulu sebelum fix." | `bp-debugging` |
| Performa | "Halaman top up lambat. Ukur dulu (request, bundle, re-render), baru usulkan perbaikan dengan angka sebelum/sesudah." | `bp-performance` |
| Migrasi kode lama | "Pindahkan logika top up dari `TopupPage` lama ke pola baru, bertahap, mulai characterization test." | `bp-refactor-legacy` |

## Git & rilis

| Kebutuhan | Contoh prompt | Skill |
|---|---|---|
| Commit | "Commit perubahan top up, tiket ABC-482." (atau: "Tuliskan commit message saja, saya yang commit.") | `bp-git-workflow` |
| Deskripsi MR | "Buat deskripsi MR dari diff branch ini ke main." | `bp-git-workflow` |
| Rilis | "Siapkan rilis berikutnya: tentukan versi, changelog, lalu minta konfirmasi sebelum tag." | `bp-release` |
| Catat pelajaran | "Update second brain dari commit sejak marker terakhir." | `bp-second-brain` |

## Tips

1. **Sebut sumber kebenaran**: tiket, file kontrak, link Figma/screenshot. Prompt tanpa sumber membuat agent bertanya (standar) atau berasumsi (lomba).
2. **Satu tujuan per prompt** untuk pekerjaan besar; pakai "lanjut fase N" untuk melanjutkan.
3. **Minta bukti, bukan klaim**: "jalankan lint/test dan tampilkan hasilnya".
4. **Prompt samar tetap boleh** ("bug di halaman top up") — agent akan memakai `page-map.md`; pastikan map itu terisi.
5. Bila agent melanggar aturan yang sama berulang kali, catat di second brain → promosikan jadi lint rule (`bp-second-brain`).
