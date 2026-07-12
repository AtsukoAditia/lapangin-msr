# Sprint: Dashboard Split, Secret Admin Path & SEO Management

**Date:** 2026-07-12
**Branch strategy:** feature per update → main

---

## 1. Dashboard Split — Tiga Role, Tiga Dashboard

### Problem
Semua role (admin, owner, user) pakai `/admin/` yang sama. Owner bisa daftar sendiri tapi gak punya dashboard sendiri. Super admin dan owner campur di satu tempat.

### Solution
Tiga dashboard terpisah berdasarkan role:

| Role | URL | Description |
|------|-----|-------------|
| **Super Admin** (tim Lapangin) | `/{SECRET_PATH}/` | Manage owners, approve registrations, CMS, SEO, ads |
| **Owner Lapangan** | `/dashboard/` | Manage venue sendiri, bookings, courts, stats |
| **Customer/Player** | `/profile/` | Booking history, achievements, referrals, leaderboard |

### Auth Architecture

**Cookie names:**
- `admin_auth_token` — Super admin sessions
- `owner_auth_token` — Owner sessions
- `customer_token` — Customer sessions

**JWT roles:**
- `super_admin` — Full platform access
- `admin` — Admin staff (same access as super_admin in middleware)
- `staff` — Limited admin access
- `owner` — Venue owner, scoped to own venues
- `customer` — Regular user

**Session type (`AuthSession`):**
```typescript
interface AuthSession {
  userId: string;
  role: "admin" | "super_admin" | "staff" | "customer" | "owner";
  name: string;
  email: string;
  phone?: string;
  ownerId?: string;   // For owner role — links to venue_owners.id
  impersonating?: {   // For admin viewing as owner
    ownerId: string;
    ownerName: string;
  };
}
```

### Owner Registration Flow
1. Owner daftar di `/dashboard/register` → API creates `AdminUser` (role=owner) + `VenueOwner` (status=`pending_review`)
2. Super admin review di `/{SECRET}/owners` → approve/reject
3. Owner login di `/dashboard/login` → status must be `active`
4. Owner redirected to `/dashboard/` with venue-scoped stats

### New Files
```
src/app/dashboard/
├── layout.tsx          # Owner dashboard layout (OwnerLayout)
├── login/page.tsx      # Owner login
├── register/page.tsx   # Owner registration
└── page.tsx            # Owner main dashboard (stats)

src/app/admin/owners/
└── page.tsx            # Super admin — manage owners

src/app/api/auth/owner/
├── register/route.ts   # POST — owner registration
└── login/route.ts      # POST — owner login

src/app/api/admin/owners/
├── route.ts            # GET — list all owners
└── [id]/route.ts       # PATCH — approve/reject/suspend

src/app/api/owner/
└── stats/route.ts      # GET — owner-scoped stats
```

### Adapter Methods Added
```typescript
// DatabaseAdapter interface
createAdmin(admin: AdminUser): Promise<AdminUser>
createVenueOwner(owner: VenueOwner): Promise<VenueOwner>
updateVenueOwnerStatus(id: string, status: VenueOwnerStatus, reviewedBy: string): Promise<VenueOwner>
getAllAdmins(): Promise<AdminUser[]>
```

### Domain Types
```typescript
type VenueOwnerStatus = "pending_review" | "active" | "suspended" | "rejected";

interface VenueOwner {
  id: string;
  userId: string;       // links to AdminUser.id
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  address: string;
  status: VenueOwnerStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}
```

### Middleware Protection
- `/dashboard/*` — requires `owner_auth_token` with `owner` role
- `/dashboard/login` and `/dashboard/register` — public
- `/api/owner/*` — requires owner token
- All protected: redirect to `/dashboard/login` if not authenticated

---

## 2. Secret Admin Path

### Problem
`/admin/` mudah ditebak dan bisa di-index search engine. Semua orang bisa coba akses.

### Solution
Admin panel hanya bisa diakses via secret 24-char hex path.

**Environment variable:**
```bash
# .env.local (server-only, NOT NEXT_PUBLIC)
ADMIN_SECRET_PATH=5b08d37a8d376d3f97ec3972
```

**How it works:**
1. `next.config.ts` reads `ADMIN_SECRET_PATH` at build time
2. Middleware matches 24-char hex patterns in URL
3. If path matches secret → check admin cookie → rewrite to `/admin/...`
4. If not authenticated → redirect to `/admin/login?redirect=/{secret}/...`
5. `X-Robots-Tag: noindex, nofollow` header on all admin routes

**URL behavior:**
| URL | Result |
|-----|--------|
| `/admin` | ❌ 307 → `/` (blocked) |
| `/admin/login` | ✅ 200 (public, for authentication) |
| `/{secret}` | 🔒 307 → login if not authenticated |
| `/{secret}/bookings` | 🔒 307 → login if not authenticated |
| `/{secret}` (authenticated) | ✅ 200 → rewrites to `/admin` |

**Admin login redirect:**
- Login API returns `dashboardUrl` (the secret path)
- Client uses `data.dashboardUrl` for redirect after login
- Secret path never exposed in client JS bundle

**Generate new secret:**
```bash
openssl rand -hex 12
# Update ADMIN_SECRET_PATH in .env.local
```

### Files Modified
- `src/middleware.ts` — Added secret path detection + auth enforcement
- `next.config.ts` — Cleaned up (no rewrites needed, middleware handles it)
- `.env.local` — Added `ADMIN_SECRET_PATH`
- `.env.example` — Added `ADMIN_SECRET_PATH` with generation instructions
- `src/app/api/auth/admin/login/route.ts` — Returns `dashboardUrl`
- `src/app/admin/login/page.tsx` — Uses `data.dashboardUrl` for redirect

---

## 3. SEO Management

### Problem
Tidak ada cara manage meta tags, OG tags, robots.txt, dan analytics dari dashboard.

### Solution
SEO management page di super admin panel.

**URL:** `/{SECRET}/seo`

**Features:**
- **Meta Tags:** title, description, keywords, canonical URL
- **Open Graph:** OG title, description, image (social media previews)
- **Robots & Sitemap:** robots.txt editor, sitemap toggle
- **Analytics:** Google Analytics ID, Google Tag Manager ID
- **Structured Data:** Custom JSON-LD

**Data storage:** `data/seo-settings.json` (file-based, simple MVP)

### New Files
```
src/app/admin/seo/
└── page.tsx            # SEO management UI

src/app/api/admin/seo/
└── route.ts            # GET/PUT SEO settings
```

### API
```typescript
// GET /api/admin/seo
// Returns: { settings: SeoSettings }

// PUT /api/admin/seo
// Body: SeoSettings object
// Returns: { success: true }
```

### SeoSettings Type
```typescript
interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  structuredData: string;    // JSON-LD string
  robotsTxt: string;
  sitemapEnabled: boolean;
  analyticsId: string;       // G-XXXXXXXXXX
  gtmId: string;             // GTM-XXXXXXX
}
```

---

## 4. Auth Data Source Unification

### Problem
`auth/service.ts` pakai in-memory Map untuk customer (ID: `cust-xxx`), tapi booking/loyalty pakai PostgreSQL UUID. Data gak nyambung.

### Solution
Rewrite auth service untuk delegate ke `getDatabaseAdapter()`. Semua customer operations via PostgreSQL.

**Result:** -136 lines code, single source of truth.

**Commit:** `3f1a098`

---

## 5. Known Issues Cleanup

### Lint Cleanup
- **Before:** 191 problems (189 errors + 2 warnings)
- **After:** 0 errors, 2 warnings (acceptable `<img>` tag warnings)
- ESLint config: `_` prefix pattern for unused vars, ignore `.github/` and `public/sw.js`
- Fixed 2 React hooks errors in NotificationBell
- Removed dead code in 16 files
- Commit: `dd34171`

### WhatsApp wwebjs Prep
- `src/lib/whatsapp/client.ts` — wrapper for wwebjs service API
- `.env.example` with `WWEBJS_API_URL` + `WWEBJS_API_KEY`
- Integrated into notification service (auto-deliver when ready, log-only when not)
- Commit: `ed39941`

### Payment Proof File Upload
- `POST /api/uploads/proof` — multipart/form-data, 5MB max, JPG/PNG/WebP/GIF/PDF
- Files saved to `public/uploads/payments/`
- Success page uses file upload instead of base64
- Commit: `b0ef1b7`

### Booking Phone Verification
- `GET /api/bookings/[code]?phone=xxx` — optional phone verification
- Normalizes Indonesian phone formats (0xxx, 62xxx, +62xxx)
- Returns 403 when phone doesn't match
- Backward-compatible (works without phone)
- Commit: `f6b29be`

---

## 6. Full Flow Test Results

| # | Step | Endpoint | Result |
|---|------|----------|--------|
| 1 | Register customer | `POST /api/auth/customer/register` | ✅ Created |
| 2 | Check availability | `GET /api/availability?courtId=court-f1&date=2026-07-13` | ✅ Slots available |
| 3 | Create booking | `POST /api/bookings` | ✅ `BK-260712-9D8D` → `waiting_payment` |
| 4 | Phone verify (correct) | `GET /api/bookings/BK-xxx?phone=081234567890` | ✅ 200 OK |
| 5 | Phone verify (wrong) | `GET /api/bookings/BK-xxx?phone=089999999999` | ✅ 403 rejected |
| 6 | Upload proof | `POST /api/uploads/proof` | ✅ File saved |
| 7 | Submit proof | `POST /api/payments/proof` | ✅ → `waiting_verification` |
| 8 | Admin login | `POST /api/auth/admin/login` | ✅ JWT cookie + `dashboardUrl` |
| 9 | Admin confirm | `PATCH /api/admin/bookings/BK-xxx/status` | ✅ → `confirmed` + `paid` |
| 10 | Final check | `GET /api/bookings/BK-xxx` | ✅ `confirmed` / `paid` |

**Bug found & fixed:** Admin status endpoint was ignoring `paymentStatus` param. Commit: `cf54033`.

---

## 7. Commits

| Hash | Description |
|------|-------------|
| `bd771aa` | fix: secret admin path auth enforcement |
| `550f022` | feat: secret admin path + SEO management |
| `44d26fe` | feat: dashboard split (admin/owner/user) |
| `a73a05a` | fix: eslint ignore test-results and e2e dirs |
| `cf54033` | fix: admin booking status endpoint passes paymentStatus |
| `f6b29be` | feat: booking phone verification |
| `b0ef1b7` | feat: payment proof file upload |
| `ed39941` | feat: whatsapp wwebjs integration prep |
| `dd34171` | chore: lint cleanup 191→0 errors |
| `3f1a098` | refactor: auth data source unification |

---

## 8. Demo Credentials

| Email | Password | Role | Dashboard |
|-------|----------|------|-----------|
| `admin@lapangin.id` | `Admin123!@#` | Super Admin | `/{SECRET}/` |
| `owner@lapangin.id` | `Owner123!@#` | Venue Owner | `/dashboard/` |
| `john@test.com` | `password123` | Customer | `/profile/` |

---

## 9. Production Checklist

### Before Launch
- [ ] Change `ADMIN_SECRET_PATH` to own random value
- [ ] Change `JWT_SECRET` to production value
- [ ] Set up PostgreSQL (not mock adapter)
- [ ] Set up wwebjs service for WhatsApp notifications
- [ ] Configure `RESEND_API_KEY` for email notifications
- [ ] Set up VAPID keys for web push
- [ ] Configure `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set up object storage for payment proof uploads
- [ ] Review and update SEO settings in admin panel
- [ ] Submit sitemap to Google Search Console

### Security Notes
- `ADMIN_SECRET_PATH` is server-only, never exposed to client
- All admin/dashboard/profile routes return `X-Robots-Tag: noindex, nofollow`
- Admin middleware rejects unauthenticated access to `/admin` with redirect to `/`
- Secret path middleware rejects unauthenticated access with redirect to `/admin/login`
- Owner middleware rejects unauthenticated access with redirect to `/dashboard/login`
