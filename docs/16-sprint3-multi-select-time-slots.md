# Sprint 3 — Multi-Select Time Slots

**Status:** ✅ Complete  
**Date:** 2025-06-25

## Goal

Customer can select 2+ contiguous hours in one booking. Duration and pricing calculated automatically.

## Changes

### SlotSelector (`src/components/booking/SlotSelector.tsx`)

- Changed from radio (single select) to checkbox (multi-select)
- Validates selection is contiguous (no gaps)
- Displays total duration from selected slots

### Pricing Service (`src/lib/services/pricing-service.ts`)

- `calculateBookingPrice(courtId, date, slotTimes, durationMinutes)` handles multi-slot pricing
- Sums price per selected hour

### Booking Form (`src/app/(public)/booking/form/page.tsx`)

- Receives `startTime`, `endTime`, `durationMinutes` from slot selection
- Passes all three to booking creation API

### Booking Validator (`src/lib/validators/booking-validator.ts`)

- Validates `startTime`, `endTime`, `durationMinutes` exist
- Validates `endTime > startTime`
- Validates `durationMinutes` matches time range

### API Route (`POST /api/bookings`)

- Accepts `startTime`, `endTime`, `durationMinutes`
- Forwards to `BookingService.createBooking()`

## Validation Rules

- Slots must be contiguous (e.g. 19:00-20:00, 20:00-21:00 valid; 19:00-20:00, 21:00-22:00 invalid)
- `durationMinutes` = number of selected slots × 60
- `startTime` = first slot start; `endTime` = last slot end

## Test Results

- `npm run type-check` — ✅ passed
- `npm run lint` — ✅ passed
- `npm run build` — ✅ compiled successfully
