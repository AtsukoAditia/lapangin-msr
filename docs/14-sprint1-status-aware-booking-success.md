# Sprint 1 — Status-Aware Booking Success

## Problem

Previous booking success page showed static "Booking Berhasil" regardless of actual booking status. No real-time updates. No countdown for temporary holds. Expired bookings still blocked availability.

## Solution

Rewrite booking success page as a status-aware polling page with countdown timer, and add lazy expiry cleanup to availability checks.

## Changes

### Domain Types (`src/lib/types/domain.ts`)

- Added `expiresAt?: string` to `Booking` interface.
- Added `AuditLogAction` union type.
- Added `BookingCodeRef` for public-safe booking API responses.

### Database Adapter (`src/lib/adapters/database-adapter.ts`)

- Added `getBookingByCode(code: string)` method.
- Added `expireBookings()` method.

### Mock Adapter (`src/lib/adapters/mock-adapter.ts`)

- `createBooking()` now sets `expiresAt` to 15 minutes from creation.
- Implemented `getBookingByCode()` — lookup by bookingCode.
- Implemented `expireBookings()` — cancels stale `waiting_payment` bookings.

### Booking Service (`src/lib/services/booking-service.ts`)

- Added `getBookingByCode(code: string)` — looks up by booking code.
- Added `submitPaymentProof()` — changes to `waiting_verification` / `waiting_confirmation`.
- Added `confirmBooking()` — changes to `confirmed` / `paid`.
- Added `rejectBooking()` — changes to `cancelled` / `unpaid`.
- Added `expireBookings()` — delegates to adapter.

### Booking API (`src/app/api/bookings/[id]/route.ts`)

- Now accepts both booking ID and booking code.
- Returns `BookingCodeRef` (public-safe, no phone/email/address).

### Availability API (`src/app/api/availability/route.ts`)

- Runs `expireBookings()` before checking availability (lazy cleanup).

### Booking Success Page (`src/app/(public)/booking/success/page.tsx`)

- Full rewrite: client-side polling every 5 seconds.
- Countdown timer for `waiting_payment` status.
- Status-specific UI cards:
  - `waiting_payment`: yellow banner, countdown, payment instructions link.
  - `waiting_verification`: blue banner, "Menunggu Verifikasi" with spinner.
  - `confirmed`: green banner, full booking details.
  - `cancelled`/`rejected`: red banner, next steps.

### Booking Form (`src/app/(public)/booking/form/page.tsx`)

- Updated to redirect with `?code=BOOKING_CODE` instead of `?id=...`.

## Status Flow

```
Created → waiting_payment / unpaid (15-min hold)
  ├─ Customer uploads proof → waiting_verification / waiting_confirmation
  │   ├─ Admin confirms → confirmed / paid ✅
  │   └─ Admin rejects → cancelled / unpaid ❌
  ├─ 15 min expires → cancelled / unpaid (expired) ❌
  └─ Admin cancels → cancelled / unpaid ❌
```

## Public API Safety

`GET /api/bookings/[code]` returns `BookingCodeRef`:

- Includes: bookingCode, bookingStatus, paymentStatus, sportId, venueId, courtId, bookingDate, times, price, createdAt, expiresAt, customerName (for display).
- Excludes: customerPhone, customerEmail, customerAddress, paymentProofUrl, paymentNotes.

## Testing

- Create booking → success page shows `waiting_payment` with countdown.
- Wait 5+ seconds → page still shows correct status (polling works).
- Upload proof via payment page → status changes to `waiting_verification`.
- Admin confirm → status changes to `confirmed`.
- Check availability after expiry → expired bookings no longer block slots.

## Files Modified

1. `src/lib/types/domain.ts` — Added expiresAt, AuditLogAction, BookingCodeRef.
2. `src/lib/adapters/database-adapter.ts` — Added getBookingByCode, expireBookings.
3. `src/lib/adapters/mock-adapter.ts` — Implemented getBookingByCode, expireBookings, createBooking with expiresAt.
4. `src/lib/adapters/postgres-adapter.ts` — Stub implementations.
5. `src/lib/adapters/google-sheets-adapter.ts` — Stub implementations.
6. `src/lib/services/booking-service.ts` — Added 5 new service methods.
7. `src/app/api/bookings/[id]/route.ts` — Public-safe booking lookup by code.
8. `src/app/api/availability/route.ts` — Added lazy expiry cleanup.
9. `src/app/(public)/booking/success/page.tsx` — Full status-aware rewrite.
10. `src/app/(public)/booking/form/page.tsx` — Updated redirect with booking code.
