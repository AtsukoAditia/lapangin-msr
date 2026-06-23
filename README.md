# Lapangin

Web-based PWA sports court booking system.

Target:

- Demo bisa jalan di Vercel.
- Mobile responsive.
- Admin CMS untuk owner/operator.
- Database awal menggunakan Google Spreadsheet.
- Arsitektur disiapkan agar mudah migrasi ke PostgreSQL/Supabase.
- Cocok untuk futsal, minisoccer, badminton, padel, tenis, basket, dan olahraga lain.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Google Sheets API untuk database demo
- PostgreSQL/Supabase untuk database production
- Vercel untuk deployment
- PWA manifest + service worker

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

## Progress

### ✅ Stage 0 — Persiapan Project

Next.js + TypeScript + Tailwind CSS + folder structure.

### ✅ Stage 1 — Static UI Public

Homepage, sport list, venue list, court detail, booking form, booking success.

### ✅ Stage 2 — Domain Types dan Mock Service

Types, mock data, BookingService, AvailabilityService, PricingService, MockAdapter, adapter factory.

### ✅ Stage 3 — Google Spreadsheet Adapter

GoogleSheetsAdapter, row-to-domain mappers, full CRUD.

### ✅ Stage 4 — Admin CMS Dasar

Admin dashboard, booking list, confirm/reject, courts management, pricing management, settings.

### ✅ Stage 5 — Anti Double Booking

Server-side re-check sebelum insert, HTTP 409 on conflict, UI conflict handling, audit log, comprehensive validation.

### ✅ Stage 6 — Payment Manual

Payment methods (BCA, BNI, GoPay, OVO, Dana, QRIS), payment instructions, bukti upload, admin confirm/reject.

### ⬜ Stage 7 — Notification

### ⬜ Stage 8 — PWA

### ⬜ Stage 9 — Deployment Vercel

### ⬜ Stage 10 — PostgreSQL Migration

### ⬜ Stage 11 — Production Readiness

## Architecture

```
UI Page / Component
↓
Service Layer
↓
Database Adapter
↓
Google Sheets or PostgreSQL
```

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── admin/               # Admin CMS pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── bookings/        # Booking management
│   │   ├── courts/          # Court management
│   │   ├── pricing/         # Pricing management
│   │   └── settings/        # Settings
│   ├── api/                 # API routes
│   │   ├── admin/           # Admin API
│   │   ├── bookings/        # Public booking API
│   │   ├── payments/        # Payment API (methods, proof upload)
│   │   └── availability/    # Slot availability API
│   └── (public)/            # Public booking flow
│       └── booking/
│           ├── [sport]/     # Court listing + detail
│           ├── form/        # Booking form
│           └── success/     # Booking success
├── components/
│   ├── admin/               # Admin layout
│   ├── booking/             # Booking components
│   └── ui/                  # Shared UI
├── lib/
│   ├── adapters/            # Database adapters
│   ├── services/            # Business logic (booking, availability, pricing, payment)
│   ├── types/               # Domain types
│   └── validators/          # Validation schemas
└── config/                  # App config
```

## Environment Variables

```bash
DATABASE_PROVIDER=mock            # mock | google_sheets | postgres
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lapangin
```

## License

MIT
