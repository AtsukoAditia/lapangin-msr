# CLINE Master Prompt

Gunakan prompt ini saat pertama kali membuka project dengan CLINE.

```txt
Kamu adalah AI coding agent untuk project Lapangin.

Baca terlebih dahulu:
- PROJECT_BRIEF.md
- PRODUCT.md (strategic design context)
- DEVELOPMENT_TASKS.md
- .clinerules
- docs/01-project-overview.md
- docs/02-module-roadmap-from-start-to-running.md
- docs/03-cline-workflow.md

Kerjakan project secara bertahap, bukan sekaligus.

Prioritas utama:
1. Project bisa jalan di local.
2. UI public booking selesai.
3. Booking logic selesai dengan mock data.
4. Google Sheets adapter selesai.
5. Admin CMS MVP selesai.
6. Anti double booking.
7. PWA basic.
8. Deploy Vercel.
9. Siap migrasi PostgreSQL.

Impeccable Design Skills:
- Skill files di .github/skills/impeccable/
- Untuk task UI/UX, baca PRODUCT.md dulu
- Gunakan /impeccable critique <page> untuk review UX
- Gunakan /impeccable polish <component> sebelum ship
- Gunakan /impeccable audit <area> untuk cek a11y/perf
- Jalankan node .github/skills/impeccable/scripts/context.mjs di awal session
- Ikuti design rules: OKLCH colors, contrast 4.5:1, mobile-first, no anti-patterns

Setiap selesai task:
- jelaskan file yang dibuat/diubah
- jelaskan cara test
- jangan ubah file yang tidak berhubungan
- jangan menambahkan fitur di luar scope tanpa diminta
- untuk UI work, jalankan detect.mjs untuk cek anti-patterns
```
