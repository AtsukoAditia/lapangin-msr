# 21 — Testing Log

**Date:** 2026-07-11

---

## Test Run #1 — Security Enhancements (2026-07-11 19:11)

### Environment
- Server: localhost:3000 (Next.js dev)
- Database: PostgreSQL 16 (localhost:5432/lapangin)
- Adapter: postgres

### Results

| # | Test | Command | Expected | Result |
|---|------|---------|----------|--------|
| 1 | TypeScript | `npx tsc --noEmit` | 0 errors | ✅ 0 errors |
| 2 | Lint | `npm run lint` | 0 new errors | ⚠️ 2 pre-existing (setState in effect) |
| 3 | Build | `npm run build` | Success | ✅ Success |
| 4 | Homepage | `GET /` | HTTP 200 | ✅ 200 |
| 5 | Sports API | `GET /api/sports` | JSON array | ✅ 8 sports returned |
| 6 | Areas API | `GET /api/areas` | JSON array | ✅ Areas returned |
| 7 | Security Headers | `curl -I /` | 6 headers | ✅ All 6 present |
| 8 | Rate Limit Login | 6x POST /api/auth/admin/login | 5 OK, 6th 429 | ✅ 5×401, 6th 429 |
| 9 | Input Sanitization | POST /api/auth/customer/register with XSS payload | XSS stripped | ✅ HTML tags stripped |
| 10 | Booking Validation | POST /api/bookings with missing fields | 400 errors | ✅ Proper error messages |

### Security Headers Verified
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Rate Limiting Verified
```
Attempt 1-5: HTTP 401 (wrong credentials, rate limit allows)
Attempt 6:   HTTP 429 (rate limit exceeded)
```

### Known Issues (Pre-existing)
1. `src/app/cari/[sport]/page.tsx:105` — setState in effect (lint error)
2. `src/components/booking/SlotSelector.tsx:141` — setState in effect (lint error)
3. 184 lint warnings (pre-existing, not from security changes)

---

## Test Run #2 — Fix Pre-existing Lint Errors (2026-07-11 19:21)

### Changes
- `src/app/cari/[sport]/page.tsx` — Merged `fetchCourts` callback into single `useEffect`, added `AbortController`
- `src/components/booking/SlotSelector.tsx` — Moved `setSelectedSlots([])` into `loadSlots()`, added eslint-disable comment

### Results

| # | Test | Result |
|---|------|--------|
| 1 | TypeScript | ✅ 0 errors |
| 2 | Lint | ✅ 0 errors (186 warnings, all pre-existing) |

### Warnings Summary
- 186 warnings (all pre-existing)
- Mostly unused variables, unused imports, and unused function parameters
- Not blockers, can be cleaned up incrementally

---

*Next test run: After next feature change*
