# 06 — Testing Checklist

## Public User

- [ ] Homepage tampil di mobile.
- [ ] User bisa pilih olahraga.
- [ ] User bisa pilih lapangan.
- [ ] User bisa pilih tanggal.
- [ ] Slot kosong tampil.
- [ ] Slot terisi tidak tampil sebagai available.
- [ ] User bisa submit booking.
- [ ] Booking success tampil.
- [ ] Booking code muncul.

## Admin

- [ ] Admin bisa melihat daftar booking.
- [ ] Admin bisa filter booking.
- [ ] Admin bisa confirm booking.
- [ ] Admin bisa reject booking.
- [ ] Admin bisa melihat detail booking.
- [ ] Admin bisa melihat lapangan.
- [ ] Admin bisa melihat aturan harga.

## Booking Logic

- [ ] Tidak bisa booking slot yang sama.
- [ ] Tidak bisa booking di luar jam buka.
- [ ] Tidak bisa booking lapangan nonaktif.
- [ ] Harga sesuai aturan.
- [ ] Status booking berubah benar.
- [ ] Payment status berubah benar.

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
- [ ] Mobile layout aman.
