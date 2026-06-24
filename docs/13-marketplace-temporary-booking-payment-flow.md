# 13 — Marketplace Temporary Booking & Manual Payment Flow

Dokumen ini menjelaskan update arah produk Lapangin MSR per 24 Juni 2026: Lapangin bukan hanya aplikasi booking satu venue, tetapi marketplace booking lapangan olahraga untuk banyak owner/pemilik lapangan dari berbagai daerah.

## Ringkasan keputusan produk

Halaman seperti:

```txt
/booking/success?code=BK-260624-IWYB
```

**tidak boleh dianggap sebagai booking sukses final**.

Halaman tersebut harus diperlakukan sebagai halaman **booking sementara / menunggu pembayaran**. Booking baru benar-benar berhasil setelah customer mengirim bukti transfer dan admin/owner mengonfirmasi pembayaran.

## Tujuan update

1. Customer bisa mencari lapangan berdasarkan daerah/lokasi dan jenis olahraga.
2. Customer bisa memilih venue/lapangan yang tersedia sesuai daerah dan olahraga.
3. Customer bisa memilih jam secara multi-select untuk durasi 1 jam, 2 jam, 3 jam, atau lebih.
4. Sistem membuat kode booking sementara dengan masa aktif sekitar 15 menit.
5. Selama 15 menit, slot ditahan agar tidak langsung dibooking customer lain.
6. Jika customer tidak transfer sampai waktu habis, booking otomatis dianggap expired dan slot dilepas.
7. Jika customer transfer dan upload/kirim bukti transfer, booking masuk ke status menunggu verifikasi admin/owner.
8. Booking baru dianggap berhasil setelah admin/owner mengonfirmasi pembayaran.
9. Lapangin dikembangkan sebagai marketplace agar banyak pemilik lapangan dari berbagai daerah bisa mendaftarkan venue mereka.

## Alur customer terbaru

```txt
Customer datang
  ↓
Pilih lokasi/daerah
  ↓
Pilih jenis olahraga
  ↓
Lihat venue/lapangan yang tersedia sesuai daerah + olahraga
  ↓
Pilih venue
  ↓
Pilih lapangan/court
  ↓
Pilih tanggal
  ↓
Pilih slot jam secara multi-select
  ↓
Isi data customer
  ↓
Kode booking sementara terbit
  ↓
Countdown 15 menit tampil
  ↓
Customer transfer manual
  ↓
Customer upload/kirim bukti transfer
  ↓
Admin/owner verifikasi
  ↓
Booking confirmed / rejected
```

## Arti halaman booking success

Nama route boleh tetap `/booking/success` untuk sementara agar tidak merusak flow lama, tetapi copywriting UI harus berubah.

### Jangan pakai copy ini

```txt
Booking berhasil
Pembayaran sukses
Jadwal sudah dikonfirmasi
```

### Pakai copy seperti ini

```txt
Booking Sementara Dibuat
Kode booking kamu sudah dibuat, tetapi jadwal belum final.
Silakan lakukan pembayaran sebelum waktu habis.
Booking baru valid setelah admin/owner mengonfirmasi pembayaran.
```

## Status booking yang direkomendasikan

Pisahkan status booking dan status pembayaran.

### Booking status

| Status | Arti | Slot ditahan? | Customer melihat |
| --- | --- | --- | --- |
| `waiting_payment` | Booking sementara dibuat, belum ada bukti transfer | Ya, sampai `expires_at` | Menunggu pembayaran |
| `waiting_verification` | Customer sudah upload/kirim bukti transfer | Ya | Menunggu verifikasi admin |
| `confirmed` | Admin/owner sudah menyetujui pembayaran dan booking | Ya | Booking berhasil |
| `rejected` | Admin/owner menolak bukti pembayaran/booking | Tidak | Booking ditolak |
| `expired` | Customer tidak membayar sampai countdown habis | Tidak | Booking kedaluwarsa |
| `cancelled` | Customer/admin membatalkan booking | Tidak | Booking dibatalkan |
| `completed` | Jadwal sudah selesai dimainkan | Tidak relevan | Selesai |
| `no_show` | Customer tidak datang | Tidak relevan | Tidak hadir |

### Payment status

| Status | Arti |
| --- | --- |
| `unpaid` | Belum ada pembayaran |
| `waiting_confirmation` | Bukti transfer sudah dikirim dan menunggu admin/owner |
| `dp_paid` | DP sudah dikonfirmasi |
| `paid` | Pembayaran penuh sudah dikonfirmasi |
| `rejected` | Bukti pembayaran ditolak |
| `refunded` | Pembayaran dikembalikan |

## Aturan countdown 15 menit

Saat booking dibuat, server harus menyimpan:

```txt
created_at = waktu booking dibuat
expires_at = created_at + 15 menit
booking_status = waiting_payment
payment_status = unpaid
```

Frontend menampilkan countdown berdasarkan `expires_at` dari server, bukan berdasarkan waktu lokal browser.

Jika countdown habis:

1. Public booking lookup menampilkan status expired.
2. Slot harus dilepas untuk customer lain.
3. Booking tidak perlu dihapus fisik dari database. Lebih aman ditandai `expired` agar masih ada audit/history.

Untuk MVP di Vercel/serverless, jangan bergantung penuh pada background worker. Availability service harus menganggap booking `waiting_payment` yang sudah lewat `expires_at` sebagai tidak aktif.

## Aturan slot multi-select

Untuk MVP, multi-select slot sebaiknya wajib berurutan/contiguous.

Contoh valid:

```txt
19:00 - 20:00
20:00 - 21:00
21:00 - 22:00
```

Hasil booking:

```txt
start_time = 19:00
end_time = 22:00
duration_minutes = 180
```

Contoh tidak valid untuk satu booking:

```txt
19:00 - 20:00
21:00 - 22:00
```

Untuk slot tidak berurutan, arahkan customer membuat booking terpisah. Ini lebih aman untuk pricing, validasi bentrok, dan laporan.

## Availability rules

Slot dianggap tidak tersedia jika ada booking aktif pada court, tanggal, dan rentang waktu yang overlap.

Booking aktif:

```txt
waiting_payment dengan expires_at > now()
waiting_verification
confirmed
completed untuk kebutuhan histori, tetapi tidak perlu memblokir masa depan
```

Booking tidak aktif untuk availability:

```txt
expired
rejected
cancelled
waiting_payment dengan expires_at <= now()
```

## Manual payment rules

### Sebelum transfer

- Customer hanya memiliki booking sementara.
- Status: `waiting_payment` + `unpaid`.
- Tampilkan instruksi transfer manual.
- Tampilkan countdown 15 menit.
- Tampilkan tombol upload/kirim bukti transfer.

### Setelah bukti transfer dikirim

- Status berubah menjadi `waiting_verification` + `waiting_confirmation`.
- Countdown pembayaran berhenti.
- Slot tetap ditahan.
- Customer diberi pesan bahwa admin/owner akan memverifikasi.

### Setelah admin/owner confirm

- Status berubah menjadi `confirmed`.
- Payment status menjadi `paid` atau `dp_paid`.
- Booking code menjadi valid sebagai bukti booking.
- Loyalty points baru boleh diberikan setelah status ini.

### Jika admin/owner reject

- Status berubah menjadi `rejected`.
- Payment status menjadi `rejected` atau tetap `waiting_confirmation` dengan reason, sesuai implementasi.
- Slot dilepas.
- Customer diberi alasan penolakan.

## Marketplace owner flow

Lapangin perlu mendukung lebih dari satu pemilik lapangan.

### Owner registration flow

```txt
Owner daftar
  ↓
Isi profil bisnis
  ↓
Daftarkan venue/lokasi
  ↓
Tambah lapangan/court
  ↓
Pilih olahraga yang didukung
  ↓
Atur jam operasional
  ↓
Atur harga per jam / per hari / peak hour
  ↓
Admin pusat review venue
  ↓
Venue aktif dan tampil di marketplace
```

### Role yang dibutuhkan

| Role | Akses |
| --- | --- |
| `super_admin` | Mengelola seluruh platform, owner, venue, booking, laporan |
| `owner` | Mengelola venue miliknya sendiri |
| `staff` | Mengelola booking operasional venue tertentu |
| `customer` | Booking, cek status, riwayat booking |

### Data ownership rule

Owner hanya boleh melihat dan mengubah data venue miliknya sendiri.

Contoh:

```txt
owner A punya venue A
owner B punya venue B
owner A tidak boleh melihat booking/detail customer venue B
```

## Entitas database yang perlu dikembangkan

Schema saat ini sudah memiliki `sports`, `venues`, `courts`, `bookings`, `payment_methods`, dan `admins`. Untuk marketplace, perlu pengembangan berikut.

### `areas`

Untuk filter daerah/lokasi.

Field minimal:

```txt
id
province
city
district
slug
is_active
created_at
updated_at
```

### `venue_owners`

Untuk data pemilik bisnis.

Field minimal:

```txt
id
user/admin_id
business_name
pic_name
phone
email
status: pending_review | active | suspended | rejected
created_at
updated_at
```

### Update `venues`

Tambahkan relasi owner dan area.

```txt
owner_id
area_id
approval_status: draft | pending_review | active | rejected | suspended
```

### Update `bookings`

Tambahkan field untuk expiry dan verifikasi manual.

```txt
expires_at
payment_submitted_at
payment_verified_at
payment_rejected_at
payment_rejection_reason
verified_by_admin_id
```

## UI/UX yang perlu diubah

### Public booking flow

Urutan baru:

1. Pilih lokasi/daerah.
2. Pilih olahraga.
3. Tampilkan venue/lapangan sesuai filter.
4. Tampilkan detail venue dan court.
5. Pilih tanggal.
6. Pilih jam multi-select.
7. Isi data customer.
8. Halaman booking sementara + countdown + instruksi pembayaran.
9. Upload/kirim bukti transfer.
10. Cek status booking.

### Booking success page

Ubah menjadi status-aware page.

Route dapat membaca `code` lalu fetch detail aman.

State yang harus didukung:

| State | Tampilan |
| --- | --- |
| `waiting_payment` | Countdown, instruksi bayar, upload bukti |
| `waiting_verification` | Bukti sudah diterima, menunggu admin |
| `confirmed` | Booking berhasil dan valid |
| `expired` | Waktu pembayaran habis, ajak booking ulang |
| `rejected` | Booking/pembayaran ditolak, tampilkan alasan |
| `cancelled` | Booking dibatalkan |

## API yang direkomendasikan

### Public

```txt
GET /api/areas
GET /api/sports
GET /api/venues?areaId=&sportId=
GET /api/courts?venueId=&sportId=
GET /api/availability?courtId=&date=
POST /api/bookings
GET /api/bookings/lookup?code=&phone=
POST /api/bookings/:code/payment-proof
```

Catatan keamanan: lookup booking publik minimal harus membutuhkan `code` + `phone` atau `code` + email. Jangan expose semua booking di public API.

### Admin/Owner

```txt
GET /api/admin/bookings
GET /api/admin/bookings/:id
POST /api/admin/bookings/:id/confirm-payment
POST /api/admin/bookings/:id/reject-payment
POST /api/admin/bookings/:id/cancel
GET /api/admin/venues
POST /api/admin/venues
PATCH /api/admin/venues/:id
POST /api/admin/courts
PATCH /api/admin/courts/:id
```

### Super admin marketplace

```txt
GET /api/admin/owners
POST /api/admin/owners/:id/approve
POST /api/admin/owners/:id/reject
GET /api/admin/venue-approvals
POST /api/admin/venues/:id/approve
POST /api/admin/venues/:id/reject
```

## Notifikasi yang dibutuhkan

MVP cukup pakai log dan template WhatsApp link.

Event penting:

1. Booking sementara dibuat.
2. Countdown hampir habis.
3. Bukti transfer dikirim customer.
4. Admin/owner menerima booking baru untuk diverifikasi.
5. Booking dikonfirmasi.
6. Booking ditolak.
7. Booking expired.

## Prioritas development untuk CLINE

### Sprint 1 — Benahi konsep booking success

Goal: route `/booking/success?code=...` tidak lagi menyebut booking final sukses kecuali status `confirmed`.

Task:

1. Cari halaman booking success.
2. Ubah wording menjadi booking sementara untuk status `waiting_payment`.
3. Tambahkan status rendering untuk `waiting_payment`, `waiting_verification`, `confirmed`, `expired`, `rejected`, `cancelled`.
4. Tambahkan countdown dari `expiresAt` bila data tersedia.
5. Jika belum ada `expiresAt`, fallback copy tetap aman: “menunggu pembayaran/verifikasi”.

### Sprint 2 — Temporary booking hold 15 menit

Goal: booking baru memiliki waktu kedaluwarsa.

Task:

1. Tambahkan field `expiresAt` pada domain type booking.
2. Saat create booking, set `expiresAt = now + 15 minutes`.
3. Pastikan status awal `waiting_payment` dan payment status `unpaid`.
4. Update mock adapter seed/data agar mendukung `expiresAt`.
5. Update availability service agar expired waiting payment tidak memblokir slot.

### Sprint 3 — Multi-select time slots

Goal: customer bisa memilih 2 jam atau 3 jam dalam satu booking.

Task:

1. Ubah UI slot dari single select menjadi multi-select.
2. Validasi slot wajib contiguous.
3. Hitung `startTime`, `endTime`, dan `durationMinutes` dari slot terpilih.
4. Pricing menghitung total berdasarkan durasi.
5. API booking menerima rentang waktu final, bukan array slot mentah, kecuali service memang perlu array untuk validasi.

### Sprint 4 — Manual payment proof

Goal: customer bisa mengirim bukti transfer dan admin/owner memverifikasi.

Task:

1. Tambah endpoint submit payment proof.
2. Untuk MVP, proof bisa berupa URL/text dulu sebelum file upload asli.
3. Setelah proof dikirim, status berubah menjadi `waiting_verification` dan payment status `waiting_confirmation`.
4. Admin booking detail menampilkan proof.
5. Admin bisa confirm/reject.

### Sprint 5 — Marketplace foundation

Goal: mulai mendukung banyak owner dan banyak daerah.

Task:

1. Tambahkan master area/location.
2. Tambahkan owner relation pada venue.
3. Filter public venue berdasarkan area + sport.
4. Batasi admin owner hanya bisa melihat venue/booking miliknya.
5. Super admin bisa melihat semua venue dan owner.

## Acceptance criteria utama

1. Customer tidak melihat pesan “booking sukses final” sebelum admin/owner confirm.
2. Booking baru langsung memiliki kode booking sementara dan countdown.
3. Slot temporary hold tidak bisa dipilih customer lain selama belum expired.
4. Slot temporary hold otomatis dianggap tersedia lagi setelah expired.
5. Booking dengan bukti transfer masuk status menunggu verifikasi, bukan confirmed.
6. Admin/owner harus melakukan confirm agar booking menjadi valid.
7. Owner hanya dapat mengelola venue dan booking miliknya sendiri.
8. Public API tidak membocorkan seluruh data booking/customer.

## CLINE prompt siap pakai

```txt
You are working on Lapangin MSR.
Read these docs first:
- docs/SYSTEM_TRUTH.md
- docs/CLINE_LOCAL_WORKFLOW.md
- docs/13-marketplace-temporary-booking-payment-flow.md

Important product rule:
/booking/success?code=... is not final success unless booking_status is confirmed.
A newly created booking is a temporary hold for 15 minutes with booking_status=waiting_payment and payment_status=unpaid.
After customer submits transfer proof, set booking_status=waiting_verification and payment_status=waiting_confirmation.
Only admin/owner confirmation can change booking_status to confirmed.
Expired waiting_payment bookings must not block availability.

Keep DATABASE_PROVIDER=mock for this task.
Do not expose private booking/customer data in public APIs.
Do not bypass service layer or adapter pattern.
Inspect related files before editing.
Run npm run doctor, npm run type-check, npm run lint, and npm run build before finishing.

Task:
Implement Sprint <number/name> from docs/13-marketplace-temporary-booking-payment-flow.md.
```

## Catatan keputusan bisnis

Untuk MVP, sistem pembayaran tetap manual agar cepat bisa dipakai usaha real skala awal. Payment gateway otomatis bisa ditambahkan setelah alur manual stabil.

Untuk marketplace, prioritas awal bukan komisi otomatis, tetapi:

1. Owner bisa onboarding venue.
2. Customer bisa menemukan lapangan berdasarkan daerah dan olahraga.
3. Booking tidak bentrok.
4. Pembayaran manual bisa diverifikasi.
5. Admin pusat tetap punya kontrol terhadap kualitas venue yang tampil.
