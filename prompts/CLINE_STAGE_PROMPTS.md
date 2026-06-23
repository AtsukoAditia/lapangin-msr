# CLINE Stage Prompts

## Stage 0 — Persiapan Project ✅

```txt
Kerjakan Stage 0 Persiapan Project.
Setup Next.js + TypeScript + Tailwind CSS + folder structure.
Buat .env.example, .clinerules, .clineignore.
Pastikan npm run dev bisa jalan.
```

## Stage 1 — Static UI Public ✅

```txt
Kerjakan Stage 1 Static UI Public.
Buat homepage, sport list, venue list, court detail, booking form, booking success.
Gunakan mock data.
Pastikan mobile responsive.
```

## Stage 2 — Domain Types dan Mock Service ✅

```txt
Kerjakan Stage 2 Domain Types dan Mock Service.
Buat domain types (Sport, Venue, Court, Booking, PricingRule).
Buat mock data.
Buat services (BookingService, AvailabilityService, PricingService).
Buat MockAdapter implementing DatabaseAdapter.
Buat adapter factory pattern.
```

## Stage 3 — Google Spreadsheet Adapter ✅

```txt
Kerjakan Stage 3 Google Spreadsheet Adapter.
Implement GoogleSheetsAdapter with full CRUD.
Buat row-to-domain mappers (snake_case to camelCase).
Gunakan env variables untuk credentials.
Jangan hardcode credential.
```

## Stage 4 — Admin CMS Dasar ✅

```txt
Kerjakan Stage 4 Admin CMS Dasar.
Buat admin dashboard, booking management, courts management, pricing management, settings.
Admin bisa confirm/reject booking.
Admin bisa edit courts dan pricing rules.
```

## Stage 5 — Anti Double Booking ✅

```txt
Kerjakan Stage 5 Anti Double Booking.
Validasi slot sebelum submit.
Validasi ulang di server.
Cek bentrok berdasarkan court, date, start, end, status aktif.
Error 409 jika double booking.
Audit log untuk semua mutasi booking.
Comprehensive server-side validation.
```

## Stage 6 — Payment Manual ✅

```txt
Kerjakan Stage 6 Payment Manual.
Tambahkan metode pembayaran manual (BCA, BNI, GoPay, OVO, Dana, QRIS).
Upload bukti pembayaran.
Admin confirm/reject payment.
Siapkan PaymentMethod.gateway untuk integrasi ipaymu.
```

## Stage 7 — Notification ✅

```txt
Kerjakan Stage 7 Notification.
Buat NotificationService untuk email, WhatsApp, push.
Buat notification templates.
Simpan notification log di adapter.
Buat admin notification log page.
Integrasikan notifikasi ke booking flow.
Admin alert saat booking baru masuk.
```

## Stage 8 — PWA ✅

```txt
Kerjakan Stage 8 PWA.
Enhance manifest.json (display: standalone, start_url, theme_color, icons, shortcuts).
Buat service worker dengan caching strategies (cache-first images, stale-while-revalidate static, network-first HTML).
Buat offline fallback page.
Buat service worker registration component.
Buat install prompt component.
Tambahkan PWA meta tags di layout.
Push notification listener di service worker.
Test npm run build berhasil.
```

## Stage 9 — Deployment Vercel

```txt
Kerjakan Stage 9 Deployment Vercel.
Push ke GitHub.
Import project ke Vercel.
Set environment variables.
Test preview deployment.
Test production deployment.
Cek API routes di production.
Pastikan demo URL bisa dipakai.
```

## Stage 10 — PostgreSQL Migration Preparation

```txt
Kerjakan Stage 10 PostgreSQL Migration.
Buat schema SQL.
Buat Prisma/Drizzle schema.
Implement PostgresAdapter.
Buat migration scripts.
Buat import dari Spreadsheet ke PostgreSQL.
Test adapter swap via DATABASE_PROVIDER env.
```

## Stage 11 — Production Readiness

```txt
Kerjakan Stage 11 Production Readiness.
Role-based access.
Error handling.
Rate limit booking.
Server-side validation.
Logging.
Backup data.
Terms & policy.
Admin permission.
Security check.
```
