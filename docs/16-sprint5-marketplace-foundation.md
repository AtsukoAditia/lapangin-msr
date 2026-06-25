# Sprint 5 — Marketplace Foundation

**Date:** 2026-06-25  
**Status:** ✅ Complete

## Goal

Mulai mendukung banyak owner dan banyak daerah.

## What Changed

### 1. New Entity: `Area` (src/lib/types/domain.ts)

```typescript
interface Area {
  id: string;
  province: string;
  city: string;
  district: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

Mock data: 6 areas across Jakarta, Bandung, Surabaya.

### 2. New Entity: `VenueOwner` (src/lib/types/domain.ts)

```typescript
interface VenueOwner {
  id: string;
  adminId: string;
  businessName: string;
  picName: string;
  phone: string;
  email: string;
  status: "pending_review" | "active" | "suspended" | "rejected";
  createdAt: string;
  updatedAt: string;
}
```

Mock data: 2 owners (arena-sport owner active, bintang-court owner pending_review).

### 3. Venue Updates

New optional fields on `Venue`:

- `ownerId?: string` — links to VenueOwner
- `areaId?: string` — links to Area

### 4. New DatabaseAdapter Methods

| Method                              | Purpose                                   |
| ----------------------------------- | ----------------------------------------- |
| `getAreas()`                        | List all areas                            |
| `getAreaById(id)`                   | Get single area                           |
| `getVenueOwners()`                  | List all owners                           |
| `getVenueOwnerById(id)`             | Get single owner                          |
| `getVenueOwnerByAdminId(adminId)`   | Get owner by admin user ID                |
| `getVenuesByOwner(ownerId)`         | Venues belonging to owner                 |
| `getVenuesByArea(areaId, sportId?)` | Venues in area, optional sport filter     |
| `getBookingsByOwner(ownerId)`       | All bookings for owner's venues           |
| `updateBooking(id, partial)`        | Update booking fields (payment proof etc) |

### 5. New Public API Routes

| Route                           | Method | Description             |
| ------------------------------- | ------ | ----------------------- |
| `/api/areas`                    | GET    | List active areas       |
| `/api/sports`                   | GET    | List sports (new route) |
| `/api/venues?areaId=&sportId=`  | GET    | Filtered venue list     |
| `/api/courts?venueId=&sportId=` | GET    | Filtered court list     |

### 6. New Admin API Routes

| Route                              | Method | Auth                    | Description                 |
| ---------------------------------- | ------ | ----------------------- | --------------------------- |
| `/api/admin/owners`                | GET    | super_admin             | List all owners with stats  |
| `/api/admin/owners/[id]/approve`   | POST   | super_admin             | Approve owner               |
| `/api/admin/owners/[id]/reject`    | POST   | super_admin             | Reject owner with reason    |
| `/api/admin/bookings/[id]/confirm` | POST   | owner/staff/super_admin | Confirm payment             |
| `/api/admin/bookings/[id]/reject`  | POST   | owner/staff/super_admin | Reject payment with reason  |
| `/api/admin/bookings/[id]`         | PATCH  | owner/staff/super_admin | Update booking (cancel etc) |

### 7. Updated Booking API (`/api/bookings/route.ts`)

- Expiration reduced from 30 to 15 minutes per spec
- Area-based venue lookup

### 8. Updated Payment Proof (`/api/payments/proof/route.ts`)

- Now uses `adapter.updateBooking()` instead of non-existent `submitPaymentProof()`
- Sets correct status: `waiting_verification` + `waiting_confirmation`
- Records `paymentSubmittedAt` and `paymentProofUrl`

### 9. Updated Public Booking Page (`/(public)/booking/page.tsx`)

New step 0: **Pilih Daerah** (area selector) added before sport selection.

- Grid of area cards with city/province
- "Semua Daerah" option to skip filter
- Sets `selectedAreaId` in flow state

### 10. Admin Booking Detail Page

New page at `/admin/bookings/[id]`:

- Full booking detail view
- Payment proof display (image/text)
- Countdown timer for waiting_payment
- Confirm/Reject buttons with reason modal for reject
- Status-aware display

### 11. Super Admin Owners Page

New page at `/admin/owners`:

- Table of all venue owners with business name, PIC, contact, status
- Approve/Reject buttons for pending_review owners
- Reject reason modal
- Stats summary (total, active, pending)

## Role-Based Access

### Booking visibility:

- **super_admin**: sees all bookings
- **owner/staff**: sees only bookings for venues they own
- Uses `getVenueOwnerByAdminId()` then `getBookingsByOwner()` then filters

### Venue visibility:

- **super_admin**: sees all venues
- **owner/staff**: sees only their venues
- Uses `getVenuesByOwner()` for owner filtering

## Checks Passed

- ✅ `npm run type-check` — 0 errors
- ✅ `npm run lint` — 0 errors (103 warnings, all pre-existing)
- ✅ `npm run build` — success

## Acceptance Criteria

| #   | Criteria                                       | Status |
| --- | ---------------------------------------------- | ------ |
| 1   | Owner hanya bisa lihat venue/booking miliknya  | ✅     |
| 2   | Super admin bisa lihat semua venue dan owner   | ✅     |
| 3   | Public venue filter berdasarkan area + sport   | ✅     |
| 4   | Customer bisa pilih daerah sebelum pilih sport | ✅     |
| 5   | Area data tersedia di mock adapter             | ✅     |
| 6   | Owner data tersedia di mock adapter            | ✅     |

## Files Created/Modified

**Created:**

- `src/app/api/areas/route.ts`
- `src/app/api/sports/route.ts`
- `src/app/api/venues/route.ts`
- `src/app/api/courts/route.ts`
- `src/app/api/admin/owners/route.ts`
- `src/app/api/admin/owners/[id]/approve/route.ts`
- `src/app/api/admin/owners/[id]/reject/route.ts`
- `src/app/api/admin/bookings/[id]/confirm/route.ts`
- `src/app/api/admin/bookings/[id]/reject/route.ts`
- `src/app/api/admin/bookings/[id]/route.ts`
- `src/app/admin/bookings/[id]/page.tsx`
- `src/app/admin/owners/page.tsx`
- `docs/16-sprint5-marketplace-foundation.md`

**Modified:**

- `src/lib/types/domain.ts` — Added Area, VenueOwner, venue owner/area fields
- `src/lib/adapters/database-adapter.ts` — Added marketplace methods
- `src/lib/adapters/mock-adapter.ts` — Implemented marketplace methods + mock data
- `src/lib/adapters/postgres-adapter.ts` — Stub methods for future PG impl
- `src/lib/mock-data.ts` — Added areas, venueOwners
- `src/app/api/bookings/route.ts` — 15-min expiry, area lookup
- `src/app/api/payments/proof/route.ts` — Fixed to use updateBooking
- `src/app/(public)/booking/page.tsx` — Added area selection step
