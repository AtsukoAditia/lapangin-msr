# 02 — Modul Pengerjaan from Start to Running Well

## Fase 1 — Foundation

Tujuan:
Membuat project bisa jalan, rapi, dan siap dikembangkan.

Modul:
- Project setup
- Routing setup
- Layout setup
- Global styles
- TypeScript config
- Environment config
- Folder architecture

Output:
- App jalan di localhost.
- Struktur folder rapi.
- Halaman awal tampil.

## Fase 2 — Public User Interface

Tujuan:
Membuat tampilan utama untuk customer.

Modul:
- Homepage
- Sports category
- Venue list
- Court list
- Court detail
- Date selection
- Time slot selection
- Booking form
- Booking success

Output:
- User bisa simulasi booking.
- Tampilan enak di HP.

## Fase 3 — Domain & Business Logic

Tujuan:
Memisahkan UI dari logic aplikasi.

Modul:
- Domain types
- Mock repository
- Booking service
- Availability service
- Pricing service
- Status rules
- Validation rules

Output:
- Logic booking tidak bercampur dengan tampilan.

## Fase 4 — Spreadsheet Database

Tujuan:
Menyimpan data demo ke Google Spreadsheet.

Modul:
- Google Sheets setup
- Spreadsheet schema
- Adapter interface
- GoogleSheetsAdapter
- Booking create/read
- Court read
- Pricing read
- Blocked slot read

Output:
- Data booking masuk ke Spreadsheet.
- Admin bisa membaca booking.

## Fase 5 — Admin CMS MVP

Tujuan:
Owner/operator bisa mengelola operasional dasar.

Modul:
- Admin dashboard
- Booking list
- Booking detail
- Confirm booking
- Reject booking
- Manual booking
- Court management
- Pricing management
- Blocked slots
- Settings

Output:
- Owner bisa menerima dan mengelola booking real.

## Fase 6 — Anti Double Booking

Tujuan:
Mencegah jadwal bentrok.

Modul:
- Slot availability checker
- Server-side validation
- Active booking status filter
- Conflict detection
- Audit log

Output:
- Slot yang sudah dipakai tidak bisa dibooking lagi.

## Fase 7 — Payment Manual

Tujuan:
Mendukung pembayaran manual untuk MVP.

Modul:
- Payment instruction
- Upload/link proof
- Payment status
- Admin payment verification
- DP/lunas flag

Output:
- Booking bisa dikelola dengan transfer manual.

## Fase 8 — Notification

Tujuan:
Memberi informasi ke user dan admin.

Modul:
- Booking created notification
- Booking confirmed notification
- Booking rejected notification
- Reminder before play
- WhatsApp template link
- Email notification
- Web push foundation

Output:
- Customer dan admin mendapat notifikasi penting.

## Fase 9 — PWA

Tujuan:
Web terasa seperti aplikasi mobile.

Modul:
- Manifest
- Icons
- Service worker
- Offline fallback
- Install prompt
- Mobile safe area
- Lighthouse PWA check

Output:
- App bisa di-install ke HP.

## Fase 10 — Vercel Demo

Tujuan:
Aplikasi bisa diakses online.

Modul:
- GitHub repository
- Vercel project
- Environment variables
- Preview deployment
- Production deployment
- Smoke test

Output:
- URL demo Vercel siap dipakai.

## Fase 11 — PostgreSQL Migration

Tujuan:
Menyiapkan aplikasi untuk usaha real.

Modul:
- SQL schema
- Postgres adapter
- Database provider switch
- Data migration script
- Unique constraint
- Transaction-ready booking
- Backup plan

Output:
- Aplikasi mudah pindah dari Spreadsheet ke PostgreSQL.

## Fase 12 — Running Well Checklist

Tujuan:
Aplikasi stabil untuk owner kecil.

Checklist:
- Booking flow berhasil.
- Admin bisa confirm/reject.
- Double booking dicegah.
- Data tersimpan.
- Mobile responsive.
- PWA installable.
- Deployment stabil.
- Error handling jelas.
- Data bisa diexport.
- Siap migrasi PostgreSQL.
