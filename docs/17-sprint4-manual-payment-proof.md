# Sprint 4 — Manual Payment Proof

**Status:** ✅ Complete
**Date:** 2025-06-25

## Goal

Customer can submit transfer proof (URL/text). Admin can confirm or reject payment.

## Changes

### Payment Service (`src/lib/services/payment-service.ts`)

- `submitPaymentProof(code, phone, proofUrl)` — validates lookup, updates status to `waiting_verification` + `waiting_confirmation`
- `confirmPayment(bookingId, adminId)` — sets `confirmed` + `paid`, records `paymentVerifiedAt` and `verifiedByAdminId`
- `rejectPayment(bookingId, adminId, reason)` — sets `rejected` + `rejected`, records `paymentRejectedAt` and `paymentRejectionReason`

### Booking Service (`src/lib/services/booking-service.ts`)

- `lookupBookingPublic(code, phone)` — returns safe booking data (no private fields) for public status check

### Database Adapter

- Added `submitPaymentProof(bookingId, proofUrl)` to interface
- Added `confirmPayment(bookingId, adminId)` to interface
- Added `rejectPayment(bookingId, adminId, reason)` to interface
- Added `getBookingByCode(code)` to interface

### Mock Adapter

- All new methods implemented with in-memory mock data

### API Routes

- `GET /api/bookings/lookup?code=&phone=` — public booking status lookup (requires code + phone)
- `POST /api/bookings/:code/payment-proof` — submit payment proof URL/text
- `POST /api/admin/bookings/:id/confirm-payment` — admin confirms payment
- `POST /api/admin/bookings/:id/reject-payment` — admin rejects payment with reason

### Booking Success Page (`src/app/(public)/booking/success/page.tsx`)

- Fetches real booking data via lookup API
- Shows countdown for `waiting_payment`
- Shows proof submission form for `waiting_payment`
- Shows "waiting for admin" for `waiting_verification`
- Shows confirmation for `confirmed`
- Shows rejection reason for `rejected`
- Shows expiry message for `expired`

### Admin Bookings Page (`src/app/admin/bookings/page.tsx`)

- Confirm/Reject buttons for `waiting_verification` bookings
- Reject requires reason input

## Security

- Public lookup requires `code` + `phone` (no full booking list exposed)
- Admin endpoints require admin session
- Proof is URL/text only for MVP (file upload later)

## Test Results

- `npm run type-check` — ✅ passed
- `npm run lint` — ✅ passed
- `npm run build` — ✅ compiled successfully
