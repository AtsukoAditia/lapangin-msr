# Lapangin System Truth

This document is the single reference for the current implementation state.

## Current runtime status

- Default demo runtime: `DATABASE_PROVIDER=mock`
- Google Sheets support: available for demo data, not recommended for real concurrent production booking
- PostgreSQL support: schema planned, adapter still not implemented
- Notification delivery: log-only MVP, not real email/WhatsApp delivery yet
- Payment proof upload: manual proof URL/base64 MVP, not production object storage yet

## Product direction

- Lapangin is moving toward a booking-first marketplace model for multiple sports venue owners across different areas in Indonesia.
- Public discovery should support area/location filtering plus sport filtering.
- Owners should be able to register venues/courts, but marketplace publication should remain controllable by platform admin.
- Owner/admin access must be scoped: venue owners may only access their own venues, courts, bookings, pricing, and reports.
- Community features such as roster, public session, open play, sparring, and tournament mode are roadmap features after booking, payment, auth, loyalty ledger, and owner operations are stable.

## Canonical local demo credentials

Use only these credentials in docs, tests, and local examples:

| Email             | Password    | Role        |
| ----------------- | ----------- | ----------- |
| admin@lapangin.id | Admin123!@# | Super Admin |
| owner@lapangin.id | Owner123!@# | Venue Owner |

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

- Admin: `admin_auth_token`
- Customer: `customer_token`

### Admin roles

JWT tokens store the actual admin role from DB (`super_admin`, `admin`, or `staff`). Middleware and AdminLayout client-side check both accept all three admin roles. Do not hardcode `role === "admin"` anywhere.

### Current limitation

The project still has demo/in-memory auth paths. Demo passwords are hashed, but production must move admin and customer accounts to a persistent database and remove demo credential fallback.

## Booking data privacy

- Public booking creation is allowed through `POST /api/bookings`.
- Public `GET /api/bookings` must not expose all bookings.
- Admin booking list must stay behind `/api/admin/*` and protected middleware.
- Customer booking lookup should require at least booking code plus phone/email verification before production launch.
- **Temporary MVP:** `GET /api/bookings/[code]` is open without phone/email verification. Returns only `PublicBooking` fields — no phone, email, or address exposed. This MUST be replaced with a verified lookup (booking code + phone or email) before production launch.
- Booking success page polls `GET /api/bookings/[code]` every 5 seconds for real-time status updates.
- Lazy expiry cleanup runs on both `GET /api/availability` and `GET /api/bookings/[code]` — stale `waiting_payment` bookings are expired before availability check and before booking lookup.

## Payment proof truth

- Public payment proof submission should prefer `bookingCode + phone + proofUrl`.
- Current API supports `bookingCode + proofUrl`, with optional phone verification.
- `bookingId + proofUrl` is temporary compatibility only and should be removed after the success/status UI sends `bookingCode + phone` consistently.
- Base64 proof upload is acceptable only for local/demo. Production should upload to object storage and send a stored file URL/key to the API.

## Loyalty points

Use this rate consistently unless changed by business rules:

- 1 point per Rp 10.000 confirmed booking value

Known cleanup needed:

- Move all loyalty awarding into one `LoyaltyService`.
- Prevent duplicate point awards for the same booking.
- Add a proper event/ledger model before referral, team invite, or campaign bonus.

## Production database target

PostgreSQL must be the source of truth for real usage. The recommended schema is documented in `db/postgres/schema.sql`.

Critical production requirement:

- Prevent overlapping bookings at database level, not only service level.
- Add or confirm support for `expires_at` and active-booking filtering so expired temporary holds do not block future bookings.
- Review booking/payment status enums before production migration so temporary booking, payment proof verification, rejection, and expiry are represented clearly.

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
