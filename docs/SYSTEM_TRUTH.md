# Lapangin System Truth

This document is the single reference for the current implementation state.

## Current runtime status

- Default demo runtime: `DATABASE_PROVIDER=mock`
- Google Sheets support: available for demo data, not recommended for real concurrent production booking
- PostgreSQL support: schema planned, adapter still not implemented
- Notification delivery: log-only MVP, not real email/WhatsApp delivery yet

## Product direction

- Lapangin is moving toward a marketplace model for multiple sports venue owners across different areas.
- Public discovery should support area/location filtering plus sport filtering.
- Owners should be able to register venues/courts, but marketplace publication should remain controllable by platform admin.
- Owner/admin access must be scoped: venue owners may only access their own venues, courts, bookings, pricing, and reports.

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

### Current limitation

The project still has demo/in-memory auth paths. Production must move admin and customer accounts to a persistent database and remove demo credential fallback.

## Booking data privacy

- Public booking creation is allowed through `POST /api/bookings`.
- Public `GET /api/bookings` must not expose all bookings.
- Admin booking list must stay behind `/api/admin/*` and protected middleware.
- Customer booking lookup should require at least booking code plus phone/email verification.
- Public `GET /api/bookings/[code]` returns `BookingCodeRef` — no phone, email, or address exposed.
- Booking success page polls `GET /api/bookings/[code]` every 5 seconds for real-time status updates.
- Lazy expiry cleanup runs on `GET /api/availability` — stale `waiting_payment` bookings are cancelled before availability check.

## Loyalty points

Use this rate consistently unless changed by business rules:

- 1 point per Rp 10.000 confirmed booking value

Known cleanup needed:

- Move all loyalty awarding into one `LoyaltyService`.
- Prevent duplicate point awards for the same booking.

## Production database target

PostgreSQL must be the source of truth for real usage. The recommended schema is documented in `db/postgres/schema.sql`.

Critical production requirement:

- Prevent overlapping bookings at database level, not only service level.
- Add or confirm support for `expires_at` and active-booking filtering so expired temporary holds do not block future bookings.
- Review booking/payment status enums before production migration so temporary booking, payment proof verification, rejection, and expiry are represented clearly.

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
