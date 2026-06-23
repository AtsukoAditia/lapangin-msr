# Project Brief — ArenaBook

## Deskripsi Singkat

ArenaBook adalah aplikasi booking lapangan olahraga berbasis web PWA yang memungkinkan customer melihat jadwal lapangan, memilih slot kosong, membuat booking, dan menerima notifikasi. Admin/owner dapat mengelola lapangan, harga, jadwal, booking, pembayaran, dan laporan operasional.

## Tujuan Produk

- Membantu venue olahraga menerima booking online.
- Mengurangi bentrok jadwal dan booking manual.
- Memberikan dashboard sederhana untuk owner.
- Bisa demo cepat dengan Google Spreadsheet.
- Siap ditingkatkan ke database PostgreSQL untuk penggunaan real.

## Target Pengguna

### Customer
- Mencari lapangan.
- Melihat slot tersedia.
- Booking jadwal.
- Menerima bukti booking dan notifikasi.

### Admin/Operator
- Mengelola booking masuk.
- Confirm/reject/reschedule booking.
- Input booking manual dari WhatsApp/offline.

### Owner
- Mengatur lapangan, harga, jam operasional.
- Melihat laporan omzet dan okupansi.
- Mengatur user admin/operator.

## Prinsip Development

- Mobile first.
- Simple untuk user awam.
- Admin tidak ribet.
- Booking flow harus cepat.
- Hindari double booking.
- Tidak lock-in ke Google Sheets.
- Semua akses data lewat service dan adapter.
