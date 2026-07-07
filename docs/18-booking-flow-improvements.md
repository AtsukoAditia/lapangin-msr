# Booking Flow Improvements - Documentation

## Overview
Complete overhaul of the booking flow including bug fixes, UI/UX improvements, and new features.

## Bug Fixes

### 1. `/api/sports/by-area/[areaId]` Returns Empty
**Root Cause**: `getSports()` in `postgres-adapter.ts` read `r.is_active` but `query()` converts snake_case to camelCase → `r.isActive` was undefined.

**Fix** (`src/lib/adapters/postgres-adapter.ts`):
```typescript
// Before
return rows.map((r) => ({ ... isActive: r.is_active }));

// After
return rows.map((r) => ({ ... isActive: (r.isActive ?? r.is_active) }));
```

### 2. Sport Icons Not Showing
**Root Cause**: Sport icons used slug keys (e.g., "futsal") but DB sport IDs are prefixed (e.g., "sport-futsal").

**Fix** (`src/lib/sport-icons.ts`): Added DB ID keys to both `sportEmoji` and `sportColor`.

### 3. Court Detail Page Using Mock Data
**Fix** (`src/app/(public)/booking/[sport]/[venue]/[court]/page.tsx`): Rewrote to use `getDatabaseAdapter()` instead of mock-data helpers.

### 4. Form Page Using Mock Data
**Fix** (`src/app/(public)/booking/form/page.tsx`): Changed from `getCourtById()` to fetch via `/api/courts`.

## New Features

### 1. 6-Step Booking Flow
1. 🏆 Pilih Olahraga
2. 🏟️ Pilih Lapangan
3. ⏰ Pilih Jam Main
4. 👤 Data Pelanggan
5. 💳 Pembayaran
6. ✅ Konfirmasi

### 2. Multi-Select Time Slots
- Users can select multiple consecutive time slots
- Only adjacent slots can be selected together
- Visual feedback shows total duration and time range

### 3. Disable Past Time Slots
- Slots before current time are disabled for today's date
- Past dates not affected (only today)

### 4. Photo Upload for Payment Proof
- Replaced URL input with image file upload
- Supports PNG, JPG, JPEG (max 5MB)
- Preview before upload
- File converted to base64 for storage

### 5. WhatsApp Chat Button
- Pre-filled message with booking details
- Opens WhatsApp directly
- Includes booking code, date, time, duration, total

### 6. Unique 3-Digit Transfer Code
- Random code (100-999) added to total price
- Ensures unique payment amounts for easy admin matching
- Example: Rp 150,000 + code 247 = Rp 150,247

## Files Modified

| File | Change |
|------|--------|
| `src/lib/adapters/postgres-adapter.ts` | Fix `getSports()` camelCase bug |
| `src/lib/sport-icons.ts` | Add DB sport ID keys |
| `src/lib/services/booking-service.ts` | Add unique code generation |
| `src/components/booking/BookingSteps.tsx` | 6-step with icons |
| `src/components/booking/SlotSelector.tsx` | Multi-select + past disable |
| `src/app/(public)/booking/[sport]/page.tsx` | DB adapter + 6-step |
| `src/app/(public)/booking/[sport]/[venue]/[court]/page.tsx` | DB adapter + 6-step |
| `src/app/(public)/booking/form/page.tsx` | API fetch + 6-step |
| `src/app/(public)/booking/success/page.tsx` | Photo upload + WA + unique amount |

## Testing

### API Verification
```bash
# Sports by area
curl http://localhost:3000/api/sports/by-area/area-jkt-selatan
# → Returns: Futsal, Bulu Tangkis, Mini Soccer

# Venues by sport and area
curl "http://localhost:3000/api/venues?sportId=sport-futsal&areaId=area-jkt-selatan"
# → Returns venues with courts for that sport in that area
```

### Build Verification
```bash
npm run type-check  # ✅ Passed
npm run build       # ✅ All routes compile
```

### Manual Testing Flow
1. Go to `/booking`
2. Select Provinsi → Kota → Daerah
3. Select a sport
4. Select a venue and court
5. Select date and one or more consecutive time slots
6. Fill in customer data
7. Submit booking
8. Upload payment proof photo
9. Click WhatsApp button to contact admin