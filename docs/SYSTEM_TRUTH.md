# Lapangin System Truth

This document is the single reference for the current implementation state.

## Current runtime status

- Default runtime: `DATABASE_PROVIDER=postgres`
- PostgreSQL 16: fully implemented, primary database
- Google Sheets support: available for demo data, not recommended for production
- Notification delivery: log-only MVP + WhatsApp wwebjs prep (uncomment when service ready)
- Payment proof upload: file upload via `/api/uploads/proof` (multipart/form-data, 5MB max)

## Product direction

- Lapangin is moving toward a booking-first marketplace model for multiple sports venue owners across different areas in Indonesia.
- Public discovery should support area/location filtering plus sport filtering.
- Owners should be able to register venues/courts, but marketplace publication should remain controllable by platform admin.
- Owner/admin access must be scoped: venue owners may only access their own venues, courts, bookings, pricing, and reports.
- Community features such as roster, public session, open play, sparring, and tournament mode are roadmap features after booking, payment, auth, loyalty ledger, and owner operations are stable.

## Canonical local demo credentials

| Email             | Password      | Role        | Dashboard |
| ----------------- | ------------- | ----------- | --------- |
| admin@lapangin.id | Admin123!@#   | Super Admin | `/{SECRET_PATH}/` |
| owner@lapangin.id | Owner123!@#   | Venue Owner | `/dashboard/` |
| john@example.com  | password123   | Customer    | `/profile/` |
| jane@example.com  | password123   | Customer    | `/profile/` |
| bob@example.com   | password123   | Customer    | `/profile/` |

Deprecated credentials such as `admin@lapangin.com / admin123` must not be reintroduced.

## Booking flow truth

- A booking created by a customer is not final success by default.
- `/booking/success?code=...` must be treated as a status page, not a guaranteed final success page.
- A new customer booking should start as a temporary hold with:
  - `booking_status=waiting_payment`
  - `payment_status=unpaid`
  - `expires_at = created_at + 15 minutes`
- The customer should see payment instructions and a countdown while the booking is still waiting for payment.
- If the customer does not submit payment proof before `expires_at`, the booking should be considered expired and must not block availability.
- After the customer submits payment proof, the booking should move to:
  - `booking_status=waiting_verification`
  - `payment_status=waiting_confirmation`
- A booking is only final/valid after admin or owner confirmation changes it to `booking_status=confirmed`.
- Loyalty points must only be awarded after booking confirmation, never when the temporary booking code is created.

Detailed specification: `docs/13-marketplace-temporary-booking-payment-flow.md`.

## Authentication

### Cookie names

- Admin (Super Admin): `admin_auth_token`
- Owner (Venue Owner): `owner_auth_token`
- Customer: `customer_token`

### Roles & Dashboards

| Role | Dashboard | Access |
|------|-----------|--------|
| `super_admin` | `/{SECRET_PATH}/` | Full platform: owners, CMS, SEO, ads, all data |
| `admin` / `staff` | `/{SECRET_PATH}/` | Same as super_admin (middleware accepts all admin roles) |
| `owner` | `/dashboard/` | Own venues, bookings, courts, stats only |
| `customer` | `/profile/` | Booking history, achievements, referrals, leaderboard |

### Secret Admin Path

- Admin panel accessible only via secret 24-char hex path (e.g. `/5b08d37a8d376d3f97ec3972`)
- `/admin` direct access blocked (redirects to homepage)
- `ADMIN_SECRET_PATH` env var (server-only, not `NEXT_PUBLIC`)
- Generate: `openssl rand -hex 12`

### JWT Session structure

```typescript
interface AuthSession {
  userId: string;
  role: "admin" | "super_admin" | "staff" | "customer" | "owner";
  name: string;
  email: string;
  phone?: string;
  ownerId?: string;       // For owner role
  impersonating?: {       // For admin viewing as owner
    ownerId: string;
    ownerName: string;
  };
}
```

### Current limitation

- Demo passwords are hashed, but production must remove demo credential fallback
- Owner registration creates both `AdminUser` + `VenueOwner` records

## Dashboard Architecture

### Three Dashboards

| URL | Role | Features |
|-----|------|----------|
| `/{SECRET}/` | Super Admin | Owner management, CMS, SEO, ads, all bookings, all venues, analytics, customers, settings |
| `/dashboard/` | Owner Lapangan | Venue management, court management, booking management, stats, sub-admin accounts |
| `/profile/` | Customer/Player | Booking history, achievements, referrals, leaderboard, loyalty |

### Owner Registration Flow

1. Owner daftar di `/dashboard/register` → creates `AdminUser` (role=owner) + `VenueOwner` (status=`pending_review`)
2. Super admin review di `/{SECRET}/owners` → approve/reject/suspend
3. Owner login di `/dashboard/login` → status must be `active`
4. Owner redirected to `/dashboard/` with venue-scoped stats

### VenueOwner Status

- `pending_review` — baru daftar, nunggu approval
- `active` — sudah di-approve, bisa login
- `suspended` — di-suspend oleh super admin
- `rejected` — ditolak oleh super admin

## Booking data privacy

- Public booking creation is allowed through `POST /api/bookings`.
- Public `GET /api/bookings` must not expose all bookings.
- Admin booking list must stay behind `/api/admin/*` and protected middleware.
- Customer booking lookup should require at least booking code plus phone/email verification before production launch.
- Customer booking lookup should require at least booking code plus phone/email verification before production launch.
- **Done:** `GET /api/bookings/[code]` now supports optional `?phone=xxx` query param. When provided, phone is verified against the booking's stored phone. Without phone param, returns data as before (backward-compatible). Success page should pass phone from the booking form.
- Booking success page polls `GET /api/bookings/[code]` every 5 seconds for real-time status updates.
- Lazy expiry cleanup runs on both `GET /api/availability` and `GET /api/bookings/[code]` — stale `waiting_payment` bookings are expired before availability check and before booking lookup.

## Payment proof truth

- Public payment proof submission should prefer `bookingCode + phone + proofUrl`.
- **Done:** UI now sends `bookingCode + proofUrl` (phone verification via booking lookup API).
- `bookingId + proofUrl` compatibility path has been removed.
- Base64 proof upload is acceptable only for local/demo. Production should upload to object storage and send a stored file URL/key to the API.
- **Done:** Payment proof now uses file upload via `/api/uploads/proof` (multipart/form-data, 5MB max). Files saved to `public/uploads/payments/`.

## Loyalty points

Use this rate consistently unless changed by business rules:

- 1 point per Rp 10.000 confirmed booking value

Known cleanup needed:

- Move all loyalty awarding into one `LoyaltyService`.
- Prevent duplicate point awards for the same booking.
- Add a proper event/ledger model before referral, team invite, or campaign bonus.

## Production database target

PostgreSQL must be the source of truth for real usage. Schema: `db/postgres/schema.sql`, seed: `db/postgres/seed.sql`.

### Current tables (21)

| Table | Description |
|-------|-------------|
| `areas` | Wilayah (provinsi, kota, kecamatan, kelurahan) |
| `sports` | Jenis olahraga (futsal, bulu tangkis, dll) |
| `admins` | Admin accounts (super_admin, admin, staff, owner) |
| `venue_owners` | Bisnis owner (linked to admins, status: pending_review/active/suspended/rejected) |
| `venues` | Venue/gedung olahraga (linked to owner + area) |
| `courts` | Lapangan per venue (linked to sport) |
| `customers` | User/pemain (loyalty_points, total_spent) |
| `bookings` | Booking records (status + payment status, overlap constraint) |
| `blocked_slots` | Slot waktu yang diblokir per court |
| `pricing_rules` | Aturan harga (weekday/weekend/holiday per jam) |
| `operating_hours` | Jam operasional per court per hari |
| `payment_methods` | Metode pembayaran (bank transfer, e-wallet, QRIS, cash) |
| `audit_logs` | Log audit semua aksi |
| `notification_logs` | Log notifikasi terkirim |
| `loyalty_transactions` | Ledger loyalty points (earned/redeemed/bonus/expired) |
| `reviews` | Review pelanggan per booking (1-5 rating) |
| `review_photos` | Foto yang diupload di review |
| `rewards` | Reward yang bisa ditukar dengan points |
| `reward_redemptions` | Penukaran reward oleh customer |
| `referrals` | Referral code + tracking (referrer → referee) |
| `holidays` | Tanggal merah Indonesia 2025-2027 (national/religious/joint_leave) |

### Critical production requirements

- Prevent overlapping bookings at database level (`bookings_no_active_overlap` constraint)
- `expires_at` + active-booking filtering — expired holds don't block future bookings
- Review booking/payment status enums before production migration
- Move all loyalty awarding into one `LoyaltyService`
- Prevent duplicate point awards (`loyalty_one_earned_tx_per_booking` unique index)

## Sprint 2 — Temporary booking hold

- `Booking.expiresAt` field exists on domain type, defaults to `created_at + 15 minutes`.
- `BookingService.createBooking()` sets `expiresAt` automatically.
- `AvailabilityService.getAvailableSlots()` filters out expired `waiting_payment` bookings before checking overlaps.
- Mock adapter seeds include `expiresAt` values.
- `GET /api/bookings/[code]` runs lazy expiry cleanup — if `waiting_payment` and `expiresAt < now()`, booking marked `expired` before returning.
- `GET /api/availability` also runs lazy expiry cleanup before slot check.

## Sprint 3 — Multi-select time slots

- `SlotSelector` component supports multi-select with contiguous-only validation.
- Selecting non-contiguous slots shows warning and blocks submission.
- `startTime`/`endTime`/`durationMinutes` calculated from first and last selected slot.
- Pricing uses `PricingService.calculatePrice()` with `durationMinutes`.
- `BookingService.createBooking()` validates contiguous slots server-side.

## Sprint 4 — Manual payment proof

- `POST /api/payments/proof` accepts:
  - preferred MVP payload: `bookingCode`, optional `phone`, and `proofUrl`
  - temporary compatibility payload: `bookingId` and `proofUrl`
- On submit: `booking_status → waiting_verification`, `payment_status → waiting_confirmation`, `expires_at` cleared.
- `POST /api/admin/bookings/[id]/confirm` sets `booking_status → confirmed`, `payment_status → paid`.
- `POST /api/admin/bookings/[id]/reject` accepts `reason`, sets `booking_status → rejected`, `payment_status → rejected`.
- Payment proof stored in `Booking.paymentProofUrl`.

## Sprint 5 — Marketplace foundation

- `Area` type + mock data (5 areas: Jakarta, Bandung, Surabaya, Tangerang, Sleman — all with village/district level).
- `VenueOwner` type + mock data (2 owners).
- `Venue` extended with `ownerId`, `areaId`, `approvalStatus`, `description`, `address`, `facilities`, `openTime`, `closeTime`.
- `DatabaseAdapter` interface extended: `getAreas()`, `getAreaById()`, `getVenueOwners()`, `getVenueOwnerById()`, `getVenuesByOwner()`, `getBookingsByOwner()`.
- Public APIs: `GET /api/areas`, `GET /api/sports`, `GET /api/venues?areaId=&sportId=`, `GET /api/courts?venueId=&sportId=`.
- Main booking page (`/booking`) has area selection pills + sport cards with `areaId` pass-through.
- Sport venue page (`/booking/[sport]`) filters venues by `areaId` query param.
- Owner access control stub: `getVenuesByOwner()` and `getBookingsByOwner()` on mock adapter.

## Gap sync before new advanced features

Before building referral, public roster, public booking visibility, open play, sparring, or tournaments, prioritize:

1. Remove old demo credential drift from docs and tests.
2. Finish verified booking lookup and payment proof UI using booking code + phone/email.
3. Extract loyalty logic into `LoyaltyService` and prevent duplicate awards.
4. Implement owner-scoped authorization consistently.
5. Decide production storage path: PostgreSQL adapter first, then payment/object storage integration.
6. Add privacy-safe public schedule/session model.

Detailed local plan: `docs/14-marketplace-gap-sync-plan.md`.

## CI/CD

CI must keep running:

- `npm ci`
- `npm run type-check`
- `npm run lint`
- `npm run build`

Before production deploy, configure Vercel env variables:

- `JWT_SECRET`
- `DATABASE_PROVIDER=postgres`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- payment/notification provider keys when those integrations are enabled
