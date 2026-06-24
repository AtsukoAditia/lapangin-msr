# Lapangin System Truth

This document is the single reference for the current implementation state.

## Current runtime status

- Default demo runtime: `DATABASE_PROVIDER=mock`
- Google Sheets support: available for demo data, not recommended for real concurrent production booking
- PostgreSQL support: schema planned, adapter still not implemented
- Notification delivery: log-only MVP, not real email/WhatsApp delivery yet

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
