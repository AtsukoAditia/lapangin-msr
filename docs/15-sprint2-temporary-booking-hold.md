# Sprint 2 — Temporary Booking Hold 15 Minutes

**Status:** ✅ Complete  
**Date:** 2025-06-25

## Goal

New bookings have expiration time. 15-minute countdown enforced server-side.

## Changes

### Domain Types (`src/lib/types/domain.ts`)

- Added `expiresAt?: string` to `Booking` interface
- Added `Area` interface (id, province, city, district, slug, isActive, createdAt, updatedAt)
- Added `VenueOwner` interface (id, adminId, businessName, picName, phone, email, status, createdAt, updatedAt)

### Mock Data (`src/lib/mock-data.ts`)

- Existing bookings have `expiresAt` set (past for `expired`, future for `waiting_payment`)
- Added `areas` seed data (3 areas: Jakarta Selatan, Bandung Kota, Surabaya Kota)
- Added `venueOwners` seed data (2 owners)

### Database Adapter (`src/lib/adapters/database-adapter.ts`)

- Added `getAreas()`, `getArea()` to interface
- Added `getVenueOwners()`, `getVenueOwner()` to interface

### Mock Adapter (`src/lib/adapters/mock-adapter.ts`)

- Implemented `getAreas()`, `getArea()`, `getVenueOwners()`, `getVenueOwner()`

### Booking Service (`src/lib/services/booking-service.ts`)

- Uses server time for `expiresAt` (ignores client value)

### Availability Service (`src/lib/services/availability-service.ts`)

- Already excludes expired `waiting_payment` bookings from active booking filter

### API Routes

- `GET /api/areas` — list active areas
- `GET /api/sports` — list all sports
- `GET /api/venues?areaId=&sportId=` — filtered venue listing

## Test Results

- `npm run type-check` — ✅ passed
- `npm run lint` — ✅ passed (pre-existing warnings only)
- `npm run build` — ✅ compiled successfully
