# 03 — Panduan Kerja CLINE

## Cara Pakai

Jangan minta CLINE membuat semua fitur sekaligus. Pecah menjadi task kecil.

Pola instruksi terbaik:

```txt
Kerjakan hanya modul [nama modul].
Baca PROJECT_BRIEF.md, DEVELOPMENT_TASKS.md, dan .clinerules dulu.
Jangan ubah bagian lain yang tidak berhubungan.
Setelah selesai, jelaskan file apa saja yang dibuat/diubah dan cara mengetesnya.
```

## Prompt Awal untuk CLINE

```txt
Baca semua file dokumentasi project ini:
- PROJECT_BRIEF.md
- DEVELOPMENT_TASKS.md
- .clinerules
- docs/01-project-overview.md
- docs/02-module-roadmap-from-start-to-running.md

Tugas pertama:
Setup project Next.js App Router + TypeScript + Tailwind dengan struktur folder yang sudah disediakan.
Pastikan `npm run dev` berjalan.
Buat homepage sederhana untuk ArenaBook dengan tampilan mobile responsive.
Jangan buat database dulu.
Jangan buat fitur admin dulu.
```

## Prompt Modul UI Public

```txt
Kerjakan modul Public User Interface.

Buat halaman:
- homepage
- list olahraga
- list lapangan
- detail lapangan
- halaman booking
- halaman booking success

Gunakan mock data dulu.
Pastikan mobile responsive.
Jangan hubungkan ke Google Sheets dulu.
Semua data mock harus disimpan di `src/lib/mock`.
```

## Prompt Modul Booking Logic

```txt
Kerjakan modul Domain & Business Logic.

Buat:
- domain types
- booking service
- availability service
- pricing service
- validation schema

Pastikan UI tidak langsung mengatur logic booking.
Booking harus punya status dan payment status.
Tambahkan fungsi pengecekan bentrok slot.
Gunakan mock data dulu.
```

## Prompt Modul Google Sheets

```txt
Kerjakan modul Google Sheets Adapter.

Buat interface DatabaseAdapter.
Buat GoogleSheetsAdapter.
Implement:
- getCourts
- getBookings
- createBooking
- updateBookingStatus
- getBlockedSlots
- getPricingRules

Gunakan environment variables dari .env.example.
Jangan hardcode spreadsheet ID atau credentials.
```

## Prompt Modul Admin CMS

```txt
Kerjakan modul Admin CMS MVP.

Buat halaman:
- /admin
- /admin/bookings
- /admin/bookings/[id]
- /admin/courts
- /admin/pricing
- /admin/settings

Fitur minimal:
- lihat booking
- confirm booking
- reject booking
- lihat data lapangan
- lihat aturan harga

Gunakan service layer yang sudah ada.
```

## Prompt Modul PWA

```txt
Kerjakan modul PWA.

Tambahkan:
- manifest
- icon placeholder
- service worker
- offline fallback
- install prompt component

Pastikan tidak merusak Next.js routing.
Pastikan app tetap jalan di local dan Vercel.
```

## Prompt Modul Deployment

```txt
Review project untuk deployment Vercel.

Cek:
- build error
- TypeScript error
- environment variables
- route handlers
- PWA assets
- runtime compatibility

Perbaiki hanya hal yang menghambat deployment.
```

## Aturan Penting

- Jangan langsung pakai PostgreSQL saat MVP Spreadsheet belum stabil.
- Jangan buat fitur payment gateway di awal.
- Jangan buat multi-owner/SaaS di awal.
- Jangan buat fitur terlalu besar dalam satu task.
- Prioritas: booking flow jalan dan admin bisa confirm.
