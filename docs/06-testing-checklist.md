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

## Booking Logic

- [ ] Tidak bisa booking slot yang sama (Stage 5).
- [x] Tidak bisa booking di luar jam buka.
- [x] Tidak bisa booking lapangan nonaktif.
- [x] Harga sesuai aturan.
- [x] Status booking berubah benar.
- [x] Payment status berubah benar.

## Build & Compilation

- [x] `npm run build` berhasil tanpa error TypeScript.
- [x] Semua 29 pages/routes ter-generate.
- [x] Admin pages ter-generate sebagai static pages.
- [x] Admin API routes ter-generate sebagai dynamic server functions.

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
