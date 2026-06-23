# 05 — PostgreSQL Migration Plan

## Tujuan

Memindahkan database dari Google Spreadsheet ke PostgreSQL tanpa mengubah logic aplikasi.

## Prinsip

Aplikasi harus memilih adapter berdasarkan environment variable:

```txt
DATABASE_PROVIDER=google_sheets
```

atau

```txt
DATABASE_PROVIDER=postgres
```

## Langkah Migrasi

1. Finalkan schema Spreadsheet.
2. Buat schema PostgreSQL yang setara.
3. Buat PostgresAdapter.
4. Export data Spreadsheet ke CSV.
5. Import CSV ke PostgreSQL.
6. Aktifkan constraint anti double booking.
7. Test semua flow.
8. Ubah `DATABASE_PROVIDER=postgres`.
9. Deploy ulang.

## Constraint Penting

Untuk production, buat constraint agar booking tidak bentrok.

Contoh pendekatan sederhana:
- `court_id`
- `booking_date`
- `start_time`
- `end_time`
- active status

Untuk pendekatan lebih kuat:
- gunakan table `booking_slots`
- satu slot = satu record
- booking mengambil beberapa slot
- slot status harus atomic

## Risiko Spreadsheet

Spreadsheet tidak ideal untuk:
- transaksi bersamaan
- traffic tinggi
- audit kompleks
- permission granular
- query laporan besar
- constraint data

Karena itu Spreadsheet hanya untuk:
- demo
- MVP kecil
- validasi ide
- usaha skala sangat awal
