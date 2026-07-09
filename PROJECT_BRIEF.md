# Project Brief — Lapangin

## Deskripsi Singkat

Lapangin adalah aplikasi booking lapangan olahraga berbasis web PWA yang diarahkan menjadi **booking-first marketplace** untuk venue olahraga di Indonesia. Customer dapat mencari venue, melihat slot tersedia, membuat booking sementara, menyelesaikan pembayaran, menerima status booking, dan mengumpulkan loyalty points. Admin/operator/owner dapat mengelola lapangan, harga, jadwal, booking, pembayaran, dan laporan operasional.

## Tujuan Produk

- Membantu customer booking lapangan olahraga dengan cepat dan jelas.
- Membantu venue olahraga menerima booking online tanpa bentrok jadwal.
- Mengurangi ketergantungan pada chat manual/WhatsApp untuk proses booking rutin.
- Memberikan dashboard sederhana untuk owner/operator.
- Mendukung loyalty points, referral, dan team invite secara bertahap.
- Siap menjadi marketplace multi-owner lintas area/lokasi.
- Bisa demo cepat dengan mock adapter atau Google Spreadsheet.
- Siap ditingkatkan ke PostgreSQL untuk penggunaan real setelah adapter/migration siap.

## Positioning

Lapangin bukan sekadar clone AYO. Arah yang dipilih adalah:

> Easiest court booking and venue operations platform for Indonesia.

Artinya core product harus kuat dulu di booking, payment status, owner operations, data privacy, dan loyalty ledger. Fitur komunitas seperti public roster, open play, sparring, dan turnamen adalah fase lanjutan.

## Target Pengguna

### Customer

- Mencari lapangan berdasarkan area, olahraga, venue, harga, dan slot.
- Melihat slot tersedia.
- Booking jadwal.
- Mendaftar akun agar punya history dan loyalty points.
- Submit bukti pembayaran.
- Menerima status booking dan notifikasi.
- Mengundang teman/tim untuk bergabung pada booking atau aplikasi.

### Admin/Operator

- Mengelola booking masuk.
- Confirm/reject/reschedule booking.
- Input booking manual dari WhatsApp/offline.
- Verifikasi bukti pembayaran.
- Mengelola blocked slot/maintenance.
- Membantu customer pada hari H.

### Owner

- Mengatur venue, lapangan, harga, jam operasional, dan admin/operator.
- Melihat laporan omzet, okupansi, top court, dan jam ramai.
- Melihat pending booking/payment.
- Mengelola operasional tanpa melihat data venue lain.

### Platform Admin

- Approve/reject owner dan venue.
- Mengatur marketplace publication.
- Melakukan moderation, audit, dan dispute handling.
- Mengelola konfigurasi global seperti sport, area, loyalty policy, campaign, dan payment provider.

## Prinsip Development

- Mobile first.
- Simple untuk user awam.
- Admin/operator tidak ribet.
- Booking flow harus cepat.
- Booking status harus jujur: booking sementara bukan final.
- Hindari double booking di service layer dan database layer.
- Jangan expose private customer data di public API.
- Public roster/session harus opt-in dan privacy-safe.
- Tidak lock-in ke Google Sheets.
- Semua akses data lewat service dan adapter.
- Selesaikan gap sync sebelum fitur advance.

## Prioritas Terdekat

1. Sinkronkan dokumentasi, credential, status booking/payment, dan CLINE workflow.
2. Amankan auth demo dengan hashing dan arahkan production ke database-backed auth.
3. Rapikan payment proof agar memakai booking code + phone/email verification.
4. Rapikan loyalty awarding ke ledger/service khusus.
5. Perkuat owner-scoped authorization.
6. Baru lanjut ke referral, team invite, roster, public session, dan marketplace onboarding lanjutan.
