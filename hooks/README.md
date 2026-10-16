# Hooks — penegakan otomatis

Hook mengubah aturan yang tadinya hanya tertulis menjadi pengecekan yang berjalan sendiri saat agent bekerja. Script ditulis dengan Node (tanpa dependency) agar jalan di Windows, macOS, dan Linux.

| Script | Event | Fungsi | Bila melanggar |
|---|---|---|---|
| `guard-synced-copies.mjs` | sebelum Edit/Write | Menolak edit langsung ke salinan skill `bp-*` dan agent paket di `.claude/skills`, `.agents/skills`, `.codex/skills`, `.gemini/skills`, `.claude/agents` — salinan itu akan tertimpa saat sync | Exit 2: edit dibatalkan, agent diberi tahu file sumber di `skills/tier-*/` yang harus diedit |
| `lint-edited-file.mjs` | setelah Edit/Write | Menjalankan ESLint (termasuk boundaries) pada file `src/**` yang baru diedit | Exit 2: error lint dikirim ke agent untuk langsung diperbaiki |

Skill/agent milik tim yang **bukan** dari paket (nama tidak diawali `bp-`, atau agent yang tidak ada di `agents/`) tidak diblokir.

## Pemasangan (Claude Code)

1. Gabungkan isi `settings.example.json` ke `.claude/settings.json` di root repo target (commit, agar berlaku untuk seluruh tim).
2. Sesuaikan path `guideline/` bila folder paket diberi nama lain.
3. Cek dengan perintah `/hooks` di Claude Code bahwa kedua hook terdaftar.
4. Format konfigurasi hook mengikuti dokumentasi Claude Code; bila versi Claude Code yang dipakai mengubah formatnya, sesuaikan file setting — script tidak perlu diubah selama input tetap JSON di stdin dengan `tool_input.file_path`.

Agent lain (Codex, Gemini, dsb.) punya mekanisme hook/policy sendiri; script ini bisa dipanggil dari sana selama input JSON yang sama diberikan. Penegakan yang berlaku untuk semua agent tetap `sync-skills.mjs --check` dan lint di CI.

## Uji manual

```bash
echo '{"tool_input":{"file_path":".claude/skills/bp-testing/SKILL.md"}}' | node guideline/hooks/guard-synced-copies.mjs; echo "exit=$?"   # → exit=2
echo '{"tool_input":{"file_path":"src/features/topup/domain/bank.ts"}}' | node guideline/hooks/guard-synced-copies.mjs; echo "exit=$?"  # → exit=0
```
