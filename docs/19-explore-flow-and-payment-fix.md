# Feature: Court Exploration Flow & Payment Approval Fix

## Overview

This document describes two major changes to Lapangin:

1. **New Court Exploration Flow** - A public-facing feature allowing users to browse all available courts across all areas, with filtering and pagination
2. **Payment Approval Bug Fix** - Critical fix enabling owners to approve bookings after customers submit payment proof

## Date

2026-07-08

## Court Exploration Flow

### Problem

The original flow required users to go through `/booking` → `/booking/[sport]` (venue-grouped list). Users wanted a simpler way to browse all courts for a sport across all areas with filtering capabilities.

### Solution

Created a new exploration flow:

```
Homepage → /explore/[sport] → /explore/[sport]/[venue]/[court] → /booking/[sport]/[venue]/[court]
```

### New Pages

#### `/explore/[sport]` - Court Listing Page

**Features:**
- Displays all courts for a selected sport as individual cards
- **Area Filter**: Filter courts by city/region using pill-shaped buttons
- **Pagination**: 9 courts per page with numbered navigation + previous/next buttons
- **Grouped by Venue**: Courts are organized under their venue name with location info
- **Empty States**: Friendly messages when no courts found for selected area
- **Animations**: Hover effects (elevation, color accent, "Lihat Detail" text reveal)
- **Mobile Responsive**: Works on all screen sizes

**Route:** `src/app/(public)/explore/[sport]/page.tsx`

**Technical Details:**
- Uses `generateStaticParams()` for all sports
- Fetches data via `getDatabaseAdapter()`
- URL-based state: area filter and pagination use search params
- Groups courts by venue for better UX
- Sorts by venue name then court name

#### `/explore/[sport]/[venue]/[court]` - Court Detail Page

**Features:**
- **Hero Visual**: Gradient banner with sport emoji and indoor/outdoor label (placeholder for future real photos)
- **Court Info Card**: Venue name, location, address, type, surface, capacity, operating hours, contact
- **Pricing Card**: Shows pricing rules (weekday/weekend/holiday) or base price
- **Booking CTA**: "Booking Sekarang" button that links directly to `/booking/[sport]/[venue]/[court]` (step 2: slot selection)
- **Breadcrumbs**: Navigation context at every step

**Route:** `src/app/(public)/explore/[sport]/[venue]/[court]/page.tsx`

**Technical Details:**
- Uses `ponytail:` comment for future photo field upgrade path
- Displays all court metadata from domain types
- Links to existing slot selection flow

### Modified Files

#### `src/app/page.tsx`

**Change:** Updated sport card links from `/booking/[sport]` to `/explore/[sport]`

**Impact:** Users clicking sport cards on homepage now go to the exploration flow

### Commit History

```bash
# Court exploration pages
git commit 28b4973 - feat: add court exploration pages with area filter and pagination

# Homepage link update
git commit a36bc9c - feat: update homepage sport cards to link to explore page
```

---

## Payment Approval Bug Fix

### Problem

**Critical Bug**: After a customer submitted payment proof, the booking status changed to `waiting_verification` (per SYSTEM_TRUTH.md), but the admin bookings page only showed the "Konfirmasi Bayar" and "Tolak Bayar" buttons when the status was `waiting_payment`. This meant owners **could not approve any bookings** where customers had successfully transferred payment.

### Root Cause

In `src/app/admin/bookings/page.tsx`, the action buttons had this condition:

```tsx
{booking.bookingStatus === "waiting_payment" && booking.paymentProofUrl && (
  // Confirm/Reject buttons
)}
```

But according to `SYSTEM_TRUTH.md` and `docs/17-sprint4-manual-payment-proof.md`:
- After payment proof submission: `bookingStatus → waiting_verification`, `paymentStatus → waiting_confirmation`
- The payment proof is stored in `paymentProofUrl`

So the condition should check for `waiting_verification`, not `waiting_payment`.

### Solution

#### `src/app/admin/bookings/page.tsx`

**Changes:**
1. Added `waiting_verification` to `STATUS_CONFIG`:
   ```tsx
   waiting_verification: {
     label: "Verifikasi Pembayaran",
     color: "bg-purple-100 text-purple-800",
   }
   ```

2. Added `expired` to `STATUS_CONFIG`:
   ```tsx
   expired: { label: "Kadaluarsa", color: "bg-stone-100 text-stone-800" }
   ```

3. Changed payment action button condition:
   ```tsx
   // Before:
   {booking.bookingStatus === "waiting_payment" && booking.paymentProofUrl && ...}

   // After:
   {booking.bookingStatus === "waiting_verification" && booking.paymentProofUrl && ...}
   ```

4. Added color mappings for new statuses in filter chips:
   ```tsx
   key === "waiting_verification" ? "bg-purple-500" :
   key === "expired" ? "bg-stone-500" :
   ```

5. Added status bar colors for new statuses:
   ```tsx
   booking.bookingStatus === "waiting_verification" ? "bg-purple-500" :
   booking.bookingStatus === "expired" ? "bg-stone-400" :
   ```

#### `src/app/admin/page.tsx`

**Changes:**
1. Updated "Menunggu Konfirmasi" stat to count both `pending` AND `waiting_verification`:
   ```tsx
   pendingBookings: bookings.filter(
     (b) => b.bookingStatus === "pending" || b.bookingStatus === "waiting_verification"
   ).length
   ```

**Impact:** Dashboard now correctly shows how many bookings need owner attention (both pending confirmation and payment verification)

### Booking Status Flow (Now Correct)

```
1. Customer creates booking
   → bookingStatus: waiting_payment
   → paymentStatus: unpaid
   → expiresAt: created_at + 15 minutes

2. Customer submits payment proof (POST /api/payments/proof)
   → bookingStatus: waiting_verification
   → paymentStatus: waiting_confirmation
   → paymentProofUrl: [uploaded URL]

3. Owner reviews and clicks "Konfirmasi Bayar" (POST /api/admin/payments/[id])
   → bookingStatus: confirmed
   → paymentStatus: paid

4. Owner reviews and clicks "Tolak Bayar" (POST /api/admin/payments/[id])
   → bookingStatus: rejected
   → paymentStatus: rejected
```

### Commit History

```bash
git commit a699f47 - fix: enable owner approval for bookings with payment proof
```

---

## Testing

### Manual Test Cases

#### Court Exploration Flow
1. **Homepage → Sport Card Click**
   - Click any sport card in "Olahraga yang Tersedia" section
   - Verify: Redirects to `/explore/[sport]`
   - Verify: Shows all courts for that sport

2. **Area Filter**
   - On `/explore/[sport]`, click a city filter pill
   - Verify: Only courts from that area are shown
   - Verify: Filter pill is highlighted
   - Verify: "Semua Daerah" pill resets filter

3. **Pagination**
   - On `/explore/[sport]` with many courts, verify pagination controls appear
   - Click "Selanjutnya" → Verify: Next page of courts loads
   - Click page number → Verify: Correct page loads
   - Click "Sebelumnya" → Verify: Previous page loads

4. **Court Card → Detail**
   - Click any court card
   - Verify: Redirects to `/explore/[sport]/[venue]/[court]`
   - Verify: Shows court visual, info, pricing
   - Verify: "Booking Sekarang" button is visible

5. **Booking Button**
   - On court detail page, click "Booking Sekarang"
   - Verify: Redirects to `/booking/[sport]/[venue]/[court]`
   - Verify: Slot selector is shown (step 2 of booking flow)

#### Payment Approval Fix
1. **Create Booking**
   - Create a test booking
   - Verify: Status is `waiting_payment`

2. **Submit Payment Proof**
   - Submit payment proof via `/api/payments/proof`
   - Verify: Status changes to `waiting_verification`
   - Verify: `paymentProofUrl` is set

3. **Admin View**
   - Go to `/admin/bookings`
   - Verify: Booking appears with "Verifikasi Pembayaran" badge (purple)
   - Verify: "Lihat Bukti" link is visible
   - Verify: "Konfirmasi Bayar" and "Tolak Bayar" buttons are visible

4. **Approve Payment**
   - Click "Konfirmasi Bayar"
   - Verify: Status changes to `confirmed`
   - Verify: `paymentStatus` changes to `paid`

5. **Dashboard Stats**
   - Go to `/admin`
   - Verify: "Menunggu Konfirmasi" count includes both `pending` and `waiting_verification` bookings

### Automated Checks
```bash
npm run type-check   # ✅ Passes
npm run lint         # ✅ Passes (no new errors)
npm run build        # ✅ Passes
```

---

## Files Changed

### New Files
- `src/app/(public)/explore/[sport]/page.tsx`
- `src/app/(public)/explore/[sport]/[venue]/[court]/page.tsx`

### Modified Files
- `src/app/page.tsx`
- `src/app/admin/bookings/page.tsx`
- `src/app/admin/page.tsx`

---

## References

- SYSTEM_TRUTH.md - Booking flow truth
- docs/17-sprint4-manual-payment-proof.md - Payment proof flow specification
- docs/16-sprint5-marketplace-foundation.md - Marketplace foundation