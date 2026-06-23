# Development Tasks — From Start to Running Well

## Stage 0 — Persiapan Project ✅

- [x] Buat project Next.js + TypeScript.
- [x] Setup Tailwind CSS.
- [x] Setup alias import `@/*`.
- [x] Setup struktur folder.
- [x] Tambahkan `.env.example`.
- [x] Tambahkan `.clinerules`.
- [x] Tambahkan `.clineignore`.
- [x] Jalankan `npm run dev`.

Definition of Done:

- App bisa dibuka di localhost. ✅
- Tidak ada error TypeScript dasar. ✅
- Struktur folder sudah rapi. ✅

## Stage 1 — Static UI Public ✅

- [x] Homepage.
- [x] List olahraga (sport category page).
- [x] List venue/lapangan (per sport).
- [x] Detail lapangan (court detail with slot selector).
- [x] Booking date picker (SlotSelector component).
- [x] Slot jam (SlotSelector time grid).
- [x] Booking form (customer name, phone, email).
- [x] Booking success page.

Definition of Done:

- User bisa simulasi booking tanpa database. ✅
- Tampilan mobile responsive. ✅

## Stage 2 — Domain Types dan Mock Service ✅

- [x] Buat type `Sport`, `Venue`, `Court`, `Booking`, `PricingRule`.
- [x] Buat mock data.
- [x] Buat `BookingService`.
- [x] Buat `AvailabilityService`.
- [x] Buat `PricingService`.
- [x] Buat `MockAdapter` implementing `DatabaseAdapter`.
- [x] Adapter factory pattern (`mock` | `google_sheets` | `postgres`).
- [x] Wire services ke API routes (`/api/bookings`, `/api/availability`).

Definition of Done:

- UI tidak langsung membaca array mentah. ✅
- Semua data lewat service. ✅

## Stage 3 — Google Spreadsheet Adapter ✅

- [x] Install `google-spreadsheet` dan `google-auth-library`.
- [x] Implement `GoogleSheetsAdapter` with full CRUD.
- [x] Row-to-domain mappers (snake_case → camelCase).
- [x] `getSports`, `getVenues`, `getCourts`.
- [x] `getBookings`, `getBookingsByCourtAndDate`, `createBooking`, `updateBookingStatus`.
- [x] `getPricingRules`, `getBlockedSlots`.
- [x] `.env.example` sudah include `GOOGLE_SHEETS_*` variables.

> **Note:** Untuk menggunakan Google Sheets, user perlu:
>
> 1. Buat service account di Google Cloud.
> 2. Buat Google Spreadsheet dengan tab sesuai schema.
> 3. Share Spreadsheet ke email service account.
> 4. Set `DATABASE_PROVIDER=google_sheets` di `.env.local`.

Definition of Done:

- Booking dari web tersimpan ke Spreadsheet. ✅ (when configured)
- Admin bisa melihat data booking dari Spreadsheet. ✅ (when configured)

## Stage 4 — Admin CMS Dasar ✅

- [x] Dashboard admin (statistik overview).
- [x] Booking list (filter status, pagination).
- [x] Booking detail (view all info).
- [x] Confirm booking (admin action).
- [x] Reject booking (admin action).
- [x] Courts management (list, edit name/price/active).
- [x] Pricing management (CRUD aturan harga).
- [x] Settings page (app info, jam operasional, database info).

> **Note:** Blocked slots management ditunda ke Stage 5 bersama fitur anti double-booking.

Definition of Done:

- Admin bisa mengatur booking dan data utama. ✅
- Owner bisa menjalankan operasional dasar. ✅

### Arsitektur Admin CMS:

- **Admin Layout** (`src/components/admin/AdminLayout.tsx`) — Sidebar responsive + topbar.
- **Admin Dashboard** (`src/app/admin/page.tsx`) — Stats cards, booking terbaru.
- **Admin Bookings** (`src/app/admin/bookings/page.tsx`) — List, detail modal, confirm/reject.
- **Admin Courts** (`src/app/admin/courts/page.tsx`) — List, inline edit.
- **Admin Pricing** (`src/app/admin/pricing/page.tsx`) — CRUD aturan harga.
- **Admin Settings** (`src/app/admin/settings/page.tsx`) — Pengaturan umum.
- **API Routes:**
  - `GET/POST /api/admin/bookings` — List & create booking.
  - `PATCH /api/admin/bookings/[id]/status` — Update status (confirm/reject).
  - `GET/PATCH /api/admin/courts` — List & update court.
  - `GET/POST/PATCH/DELETE /api/admin/pricing` — CRUD pricing rules.
- **Adapter methods:** `getBookingStats`, `updateCourt`, `getPricingRules`, `updatePricingRule`, `deletePricingRule`.

## Stage 5 — Anti Double Booking

- [ ] Validasi slot sebelum submit.
- [ ] Validasi ulang di server.
- [ ] Cek bentrok berdasarkan court, date, start, end, status aktif.
- [ ] Tambahkan status booking.
- [ ] Tambahkan audit log.

Definition of Done:

- Slot yang sudah pending/confirmed tidak bisa dibooking ulang.
- Semua mutasi booking tercatat.

## Stage 6 — Payment Manual

- [ ] Tambahkan metode pembayaran manual.
- [ ] Upload/link bukti pembayaran.
- [ ] Status `waiting_payment`, `paid`, `confirmed`.
- [ ] Admin mark as paid.
- [ ] Template instruksi pembayaran.

Definition of Done:

- Booking bisa melewati alur pembayaran manual.

## Stage 7 — Notification

- [ ] Email notification.
- [ ] WhatsApp template redirect.
- [ ] Web push basic.
- [ ] Reminder sebelum main.
- [ ] Notification log.

Definition of Done:

- User menerima minimal satu kanal notifikasi.
- Admin bisa melihat log notifikasi.

## Stage 8 — PWA

- [ ] Tambahkan manifest.
- [ ] Tambahkan icon PWA.
- [ ] Tambahkan service worker.
- [ ] Offline fallback page.
- [ ] Install prompt.
- [ ] Test Lighthouse PWA.

Definition of Done:

- Aplikasi bisa di-install.
- Tampilan mobile terasa seperti app.

## Stage 9 — Deployment Vercel

- [ ] Push ke GitHub.
- [ ] Import project ke Vercel.
- [ ] Set environment variables.
- [ ] Test preview deployment.
- [ ] Test production deployment.
- [ ] Cek API routes di production.

Definition of Done:

- Demo URL Vercel bisa dipakai.
- Booking dari demo masuk ke Spreadsheet.

## Stage 10 — PostgreSQL Migration Preparation

- [ ] Buat schema SQL.
- [ ] Buat Prisma/Drizzle schema.
- [ ] Buat `PostgresAdapter`.
- [ ] Buat migration scripts.
- [ ] Buat import dari Spreadsheet ke PostgreSQL.
- [ ] Test adapter swap.

Definition of Done:

- ENV bisa memilih adapter:
  - `DATABASE_PROVIDER=google_sheets`
  - `DATABASE_PROVIDER=postgres`
- Logic aplikasi tidak berubah saat database diganti.

## Stage 11 — Production Readiness

- [ ] Role-based access.
- [ ] Error handling.
- [ ] Rate limit booking.
- [ ] Server-side validation.
- [ ] Logging.
- [ ] Backup data.
- [ ] Terms & policy.
- [ ] Admin permission.
- [ ] Security check.

Definition of Done:

- Aplikasi layak dipakai owner usaha kecil.
