# 20 — Webapp Security Audit & Enhancements

**Date:** 2026-07-11
**Status:** ✅ Applied

---

## Audit Results — Before

| Check | Status | Risk |
|-------|--------|------|
| Security Headers | ❌ None | XSS, Clickjacking, MIME sniffing |
| Rate Limiting | ❌ None | Brute-force login, DoS |
| Input Sanitization | ❌ None | XSS, SQL Injection |
| CSRF Protection | ⚠️ Partial | SameSite=Lax on cookies |
| Auth Token | ✅ HTTP-only, SameSite=Lax | Good |
| Password Hashing | ✅ bcrypt 12 rounds | Good |
| JWT Validation | ✅ Min 32 char secret | Good |
| Middleware Auth | ✅ Role-based protection | Good |

---

## Enhancements Applied

### 1. Security Headers (`next.config.ts`)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### 2. Rate Limiting (`src/lib/security/rate-limiter.ts`)

| Limiter | Points | Duration | Applied To |
|---------|--------|----------|------------|
| `loginLimiter` | 5 | 15 min | Admin & Customer login |
| `apiLimiter` | 100 | 1 min | General API endpoints |
| `bookingLimiter` | 10 | 1 hour | Booking creation & payment |

### 3. Input Sanitization (`src/lib/security/sanitizer.ts`)

- `sanitizeHTML()` — strips HTML tags (XSS prevention)
- `sanitizeString()` — strips SQL-dangerous chars
- `sanitizeBookingInput()` — sanitizes all booking fields with length limits
- `isValidEmail()` — email format validation
- `isValidPhone()` — Indonesian phone format validation

### 4. Endpoints Protected

| Endpoint | Rate Limit | Sanitization | Status |
|----------|------------|--------------|--------|
| `POST /api/auth/admin/login` | ✅ 5/15min | ✅ | Done |
| `POST /api/auth/customer/login` | ✅ 5/15min | ✅ | Done |
| `POST /api/auth/customer/register` | ✅ 100/min | ✅ email, phone, name | Done |
| `POST /api/bookings` | ✅ 10/hour | ✅ full input | Done |
| `POST /api/payments/proof` | ✅ 10/hour | ✅ code, phone, proofUrl | Done |

---

## Security Module Structure

```
src/lib/security/
├── index.ts           # Re-exports
├── rate-limiter.ts    # RateLimiterMemory instances + helpers
└── sanitizer.ts       # Input sanitization utilities
```

---

## Recommendations for Production

| Priority | Action | Status |
|----------|--------|--------|
| High | Change JWT_SECRET to random 48+ char value | ⏳ Pending |
| High | Change DEMO_ADMIN_PASSWORD / DEMO_OWNER_PASSWORD | ⏳ Pending |
| Medium | Add CSP header (Content-Security-Policy) | ⏳ Pending |
| Medium | Add CSRF token for form submissions | ⏳ Pending |
| Low | Add request logging / audit trail for API | ⏳ Pending |
| Low | Add file upload validation (magic bytes, not just extension) | ⏳ Pending |

---

## Test Results (2026-07-11)

| Test | Result |
|------|--------|
| TypeScript check | ✅ 0 errors |
| Lint | ⚠️ 2 pre-existing errors (setState in effect), 184 warnings (pre-existing) |
| Build | ✅ Success |
| Homepage | ✅ HTTP 200 |
| GET /api/sports | ✅ Returns 8 sports |
| GET /api/areas | ✅ Returns areas |
| Security Headers | ✅ All 6 headers present |
| Rate Limit (login) | ✅ 5 attempts allowed, 6th → HTTP 429 |
| Input Sanitization | ✅ HTML tags stripped, invalid email/phone rejected |
| Booking validation | ✅ Missing fields rejected with proper errors |

---

*Document created: 2026-07-11*
