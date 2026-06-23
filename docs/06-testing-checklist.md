# 06 — Testing Checklist

## Public User

- [x] Homepage tampil di mobile.
- [x] User bisa pilih olahraga.
- [x] User bisa pilih lapangan.
- [x] User bisa pilih tanggal.
- [x] Slot kosong tampil.
- [x] Slot terisi tidak tampil sebagai available.
- [x] User bisa submit booking.
- [x] Booking success tampil.
- [x] Booking code muncul.

## Admin

- [x] Admin bisa melihat daftar booking.
- [x] Admin bisa filter booking (by status).
- [x] Admin bisa confirm booking.
- [x] Admin bisa reject booking.
- [x] Admin bisa melihat detail booking (modal).
- [x] Admin bisa melihat lapangan.
- [x] Admin bisa edit lapangan (harga, kapasitas, status aktif).
- [x] Admin bisa melihat aturan harga.
- [x] Admin bisa tambah/edit/hapus aturan harga.
- [x] Admin dashboard menampilkan statistik.
- [x] Settings page menampilkan info aplikasi.

## Admin CMS API

- [x] GET /api/admin/bookings — list bookings.
- [x] PATCH /api/admin/bookings/[id]/status — update status.
- [x] GET /api/admin/courts — list courts.
- [x] PATCH /api/admin/courts — update court.
- [x] GET /api/admin/pricing — list pricing rules.
- [x] POST /api/admin/pricing — create pricing rule.
- [x] PATCH /api/admin/pricing — update pricing rule.
- [x] DELETE /api/admin/pricing — delete pricing rule.

## Booking Logic (Anti Double Booking — Stage 5)

- [x] Tidak bisa booking slot yang sudah pending/waiting_payment/paid/confirmed.
- [x] Server mengembalikan HTTP 409 (CONFLICT) saat double-booking terdeteksi.
- [x] Re-check ketersediaan dilakukan server-side sebelum insert booking.
- [x] Booking form menampilkan pesan error konflik yang jelas.
- [x] Tombol "Pilih Jam Lain" muncul pada error konflik dan navigasi kembali ke slot selector.
- [x] Slot terpesan muncul merah di SlotSelector (pre-check availability via API).
- [x] Comprehensive server-side validation (nama, HP, durasi, format waktu, masa lalu).
- [x] Audit log tercatat setiap booking created, confirmed, rejected, cancelled.
- [x] Tidak bisa booking di luar jam buka.
- [x] Tidak bisa booking lapangan nonaktif.
- [x] Harga sesuai aturan.
- [x] Status booking berubah benar.
- [x] Payment status berubah benar.

### Anti Double Booking Architecture

| Layer     | File                                      | Responsibility                        |
| --------- | ----------------------------------------- | ------------------------------------- |
| Validator | `src/lib/validators/booking-validator.ts` | Zod schema + `validateBookingInput()` |
| Service   | `src/lib/services/booking-service.ts`     | Re-check + create + audit log         |
| API       | `src/app/api/bookings/route.ts`           | HTTP 409 on conflict                  |
| UI        | `src/app/(public)/booking/form/page.tsx`  | Conflict error + "Pilih Jam Lain"     |
| Types     | `src/lib/types/domain.ts`                 | `AuditLogEntry` type                  |
| Adapter   | All adapter files                         | `logAudit()` + `getAuditLogs()`       |

**Active blocking statuses:** `pending`, `waiting_payment`, `paid`, `confirmed`

**Overlap check:** Same `courtId` + `bookingDate` + overlapping `startTime`/`endTime`

## Payment Manual (Stage 6)

- [x] Success page menampilkan pilihan metode pembayaran setelah booking.
- [x] 6 metode pembayaran tersedia (BCA, BNI, GoPay, OVO, Dana, QRIS).
- [x] Instruksi pembayaran tampil lengkap (rekening/nomor, langkah, nominal).
- [x] User bisa upload bukti pembayaran (image/file).
- [x] Status booking berubah ke `waiting_payment` setelah upload bukti.
- [x] Bukti pembayaran tersimpan (paymentProofUrl ter-update).
- [x] User melihat "Menunggu Konfirmasi" setelah upload bukti.
- [x] Admin melihat link bukti pembayaran di halaman kelola booking.
- [x] Admin bisa klik "Konfirmasi Bayar" → booking jadi `confirmed`, payment jadi `paid`.
- [x] Admin bisa klik "Tolak Bayar" → booking kembali `waiting_payment`, bukti dihapus.
- [x] PaymentMethod.gateway field tersedia untuk integrasi ipaymu masa depan.
- [x] Build berhasil tanpa error (31 routes ter-generate).

### Payment Manual Architecture

| Layer       | File                                        | Responsibility                        |
| ----------- | ------------------------------------------- | ------------------------------------- |
| Types       | `src/lib/types/domain.ts`                   | `PaymentMethod`, `PaymentInstruction` |
| Service     | `src/lib/services/payment-service.ts`       | Payment flow logic                    |
| Adapter     | `src/lib/adapters/mock-adapter.ts`          | 6 mock payment methods                |
| Adapter     | `src/lib/adapters/google-sheets-adapter.ts` | Read payment_methods sheet            |
| API (user)  | `src/app/api/payments/methods/route.ts`     | GET payment methods                   |
| API (user)  | `src/app/api/payments/proof/route.ts`       | POST upload proof                     |
| API (user)  | `src/app/api/bookings/[id]/route.ts`        | GET booking detail                    |
| API (admin) | `src/app/api/admin/payments/[id]/route.ts`  | POST confirm/reject payment           |
| UI (user)   | `src/app/(public)/booking/success/page.tsx` | 3-step payment flow                   |
| UI (admin)  | `src/app/admin/bookings/page.tsx`           | Confirm/reject buttons + proof link   |

**Payment flow:** `pending` → `waiting_payment` (upload proof) → `confirmed` + `paid` (admin confirms)

## Notification (Stage 7)

- [x] Notifikasi terkirim saat booking dibuat (customer + admin alert).
- [x] Notifikasi terkirim saat booking dikonfirmasi admin.
- [x] Notifikasi terkirim saat booking ditolak admin.
- [x] Notifikasi terkirim saat booking dibatalkan.
- [x] WhatsApp redirect link berfungsi (wa.me link).
- [x] Email template ter-generate dengan data booking lengkap.
- [x] Push notification payload ter-format benar.
- [x] Notification log tersimpan di adapter (mock/google sheets/postgres).
- [x] Admin bisa melihat log notifikasi di `/admin/notifications`.
- [x] Admin bisa filter notifikasi berdasarkan channel dan status.
- [x] Statistik notifikasi tampil (total, sent, failed).
- [x] Notification non-blocking — booking flow tidak terganggu jika notifikasi gagal.
- [x] `GET /api/admin/notifications` berfungsi dengan pagination dan filters.

### Notification Architecture

| Layer       | File                                        | Responsibility                           |
| ----------- | ------------------------------------------- | ---------------------------------------- |
| Types       | `src/lib/types/domain.ts`                   | `NotificationLog`, channel, type, status |
| Service     | `src/lib/services/notification-service.ts`  | Send to all channels                     |
| Templates   | `src/lib/notification-templates.ts`         | Email, WhatsApp, Push message templates  |
| Adapter     | `src/lib/adapters/database-adapter.ts`      | Notification CRUD interface              |
| Adapter     | `src/lib/adapters/mock-adapter.ts`          | In-memory notification storage           |
| Adapter     | `src/lib/adapters/google-sheets-adapter.ts` | notification_logs sheet                  |
| Adapter     | `src/lib/adapters/postgres-adapter.ts`      | notification_logs table                  |
| API (admin) | `src/app/api/admin/notifications/route.ts`  | GET list notifications                   |
| UI (admin)  | `src/app/admin/notifications/page.tsx`      | Notification log list + filters          |
| Integration | `src/lib/services/booking-service.ts`       | Trigger notifications on booking events  |

**Notification types:** `booking_created`, `booking_confirmed`, `booking_rejected`, `booking_cancelled`, `payment_confirmed`, `payment_rejected`, `admin_alert`, `reminder`

**Channels:** `email` (SMTP stub), `whatsapp` (wa.me redirect), `push` (Service Worker), `in_app` (future)

**Status flow:** `pending` → `sent` | `failed` | `skipped`

## Build & Compilation

- [x] `npm run build` berhasil tanpa error TypeScript.
- [x] Semua 33 pages/routes ter-generate (termasuk notification routes).
- [x] Admin pages ter-generate sebagai static pages.
- [x] Admin API routes ter-generate sebagai dynamic server functions.
- [x] `/admin/notifications` page ter-generate.
- [x] `/api/admin/notifications` API route ter-generate.

## PWA

- [ ] Manifest terbaca.
- [ ] Icon tampil.
- [ ] App bisa di-install.
- [ ] Offline fallback bekerja.
- [ ] Lighthouse PWA minimal lolos basic check.

## Deployment

- [ ] Build berhasil.
- [ ] Environment variables lengkap.
- [ ] API route berjalan di Vercel.
- [ ] Booking masuk ke Spreadsheet.
- [x] Mobile layout aman.
