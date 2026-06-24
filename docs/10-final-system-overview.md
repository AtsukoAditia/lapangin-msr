# Lapangin — Final System Overview & Documentation

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Stages 1-8 Summary](#stages-1-8-summary)
3. [New Modules (Stages 9-10)](#new-modules)
4. [Admin Authentication](#admin-authentication)
5. [Customer Auth & Loyalty Points](#customer-auth--loyalty-points)
6. [UI/UX Optimization](#uiux-optimization)
7. [API Reference](#api-reference)
8. [Testing Checklist](#testing-checklist)
9. [Deployment](#deployment)

---

## System Architecture

```
UI Pages (Next.js App Router)
    ↓
API Routes (Server-side validation)
    ↓
Service Layer (src/lib/services/)
    ↓
Database Adapter (src/lib/adapters/)
    ↓
Mock Adapter / Google Sheets / PostgreSQL
```

### Directory Structure

```
src/
├── app/
│   ├── (auth)/               # Customer auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── profile/page.tsx
│   ├── (public)/             # Public booking flow
│   │   └── booking/
│   │       ├── page.tsx      # Sport selection
│   │       ├── [sport]/      # Venue/court listing
│   │       ├── form/         # Booking form
│   │       └── success/      # Confirmation
│   ├── admin/                # Admin CMS (protected)
│   │   ├── login/page.tsx
│   │   ├── page.tsx          # Dashboard
│   │   ├── bookings/         # Booking management
│   │   ├── courts/           # Court management
│   │   ├── pricing/          # Pricing management
│   │   ├── notifications/    # Notification center
│   │   └── settings/         # System settings
│   ├── api/                  # API routes
│   │   ├── auth/             # Auth endpoints
│   │   ├── admin/            # Admin endpoints (protected)
│   │   ├── bookings/         # Public booking endpoints
│   │   ├── customer/         # Customer endpoints (protected)
│   │   └── payments/         # Payment endpoints
│   └── layout.tsx            # Root layout with providers
├── components/
│   ├── admin/AdminLayout.tsx
│   ├── booking/
│   │   ├── BookingSteps.tsx
│   │   └── SlotSelector.tsx
│   ├── pwa/
│   │   ├── InstallPrompt.tsx
│   │   └── ServiceWorkerRegistration.tsx
│   └── ui/Navbar.tsx
├── lib/
│   ├── adapters/             # Database adapters
│   │   ├── database-adapter.ts  # Interface
│   │   ├── mock-adapter.ts      # In-memory (development)
│   │   ├── google-sheets-adapter.ts
│   │   └── postgres-adapter.ts  # Stub for migration
│   ├── auth/
│   │   ├── context.tsx       # Auth context provider
│   │   ├── jwt.ts            # JWT token utilities
│   │   └── service.ts        # Auth service layer
│   ├── services/             # Business logic
│   ├── types/domain.ts       # TypeScript interfaces
│   └── validators/           # Input validation schemas
└── middleware.ts              # Route protection
```

---

## Stages 1-8 Summary

| Stage | Module                   | Status      |
| ----- | ------------------------ | ----------- |
| 1     | App Shell & Layout       | ✅ Complete |
| 2     | Public Homepage          | ✅ Complete |
| 3     | Court Listing            | ✅ Complete |
| 4     | Court Detail             | ✅ Complete |
| 5     | Booking Flow             | ✅ Complete |
| 6     | Booking Success          | ✅ Complete |
| 7     | Admin Dashboard          | ✅ Complete |
| 8     | Admin Booking Management | ✅ Complete |

### Key Features Per Stage

**Stage 1 — App Shell**

- Root layout with metadata, PWA manifest
- Responsive navbar with sport icons
- Global CSS with Tailwind utilities
- Database adapter pattern

**Stage 2 — Homepage**

- Hero section with animated background
- Sport category cards with hover effects
- Feature highlights (fast booking, best prices, 24/7)
- CTA sections

**Stage 3 — Court Listing**

- Filter by sport type
- Venue and court cards
- Price display with badges

**Stage 4 — Court Detail**

- Available time slots
- Pricing rules display
- Date picker

**Stage 5 — Booking Flow**

- 5-step visual progress indicator (Pilih Olahraga → Pilih Venue → Pilih Lapangan → Isi Data → Selesai)
- BookingSteps component rendered on all booking flow pages
- Real-time availability check
- Double-booking prevention
- Payment method selection

**Stage 6 — Booking Success**

- Booking confirmation page
- Booking code display
- Payment instructions

**Stage 7 — Admin Dashboard**

- Statistics overview
- Recent bookings table
- Revenue summary

**Stage 8 — Admin Booking Management**

- Full booking CRUD
- Status management (confirm/reject/complete)
- Payment verification
- Court management
- Pricing management

---

## New Modules

### Stage 9 — Admin Authentication

- JWT-based admin login
- Protected admin routes via middleware
- Admin login page at `/admin/login`
- Session management with HTTP-only cookies

### Stage 10 — Customer Auth & Loyalty Points

- Customer registration with password hashing
- Customer login with session
- Loyalty points earning (1 point per Rp 10,000 spent)
- Tier system (Bronze/Silver/Gold/Platinum)
- Reward redemption system
- Customer profile page

---

## Admin Authentication

### Login Flow

1. Navigate to `/admin/login`
2. Enter admin credentials
3. Server validates and returns JWT token
4. Token stored in HTTP-only cookie `admin_token`
5. Middleware checks cookie on all `/admin/*` routes (except `/admin/login`)

### Default Admin Credentials

```
Email: admin@lapangin.id
Password: admin123
```

### Protected Routes

All `/admin/*` routes except `/admin/login` require authentication. Unauthenticated users are redirected to `/admin/login`.

---

## Customer Auth & Loyalty Points

### Registration Flow

1. Customer visits `/register`
2. Fills name, email, phone, password
3. Server hashes password with bcrypt
4. Account created with 0 points, Bronze tier
5. JWT token set in `customer_token` cookie
6. Redirected to homepage

### Login Flow

1. Customer visits `/login`
2. Enters email and password
3. Server validates credentials
4. JWT token set in `customer_token` cookie
5. Session data available via AuthContext

### Loyalty Points System

#### Earning Points

- **1 point per Rp 10,000** spent on bookings
- Points are awarded when admin confirms a booking (status → `confirmed`)
- Bonus points for special promotions (future feature)

#### Tier System

| Tier        | Min Points | Benefits                            |
| ----------- | ---------- | ----------------------------------- |
| 🥉 Bronze   | 0          | Basic earning rate                  |
| 🥈 Silver   | 500        | 1.2x earning rate                   |
| 🥇 Gold     | 2,000      | 1.5x earning rate, priority booking |
| 💎 Platinum | 5,000      | 2x earning rate, exclusive rewards  |

#### Available Rewards

| Reward        | Points Cost | Value                        |
| ------------- | ----------- | ---------------------------- |
| Diskon 10%    | 100 pts     | 10% off next booking         |
| Diskon 25%    | 250 pts     | 25% off next booking         |
| Bonus 1 Jam   | 200 pts     | +1 hour free                 |
| Gratis 1 Sesi | 500 pts     | Free 1 session (max 2 hours) |

#### API Endpoints

```
POST /api/auth/customer/register  - Register new customer
POST /api/auth/customer/login     - Customer login
POST /api/auth/customer/logout    - Customer logout
GET  /api/customer/loyalty        - Get loyalty info (authenticated)
POST /api/customer/loyalty        - Redeem reward (authenticated)
```

---

## UI/UX Optimization

### Design Theme

- **Primary Color**: Green (#16a34a) — sports/nature vibe
- **Accent**: Amber (#f59e0b) — energy/action
- **Style**: Modern, clean, sports-themed
- **Font**: System font stack for performance

### Mobile Responsive

- All pages use mobile-first approach
- Touch-friendly buttons (min 44px tap target)
- Responsive grid layouts
- Collapsible navigation on mobile
- Optimized card layouts

### Desktop Optimization

- Wider content areas
- Multi-column layouts
- Hover effects and transitions
- Sidebar navigation in admin

### Key UI Components

- **Status Badges**: Color-coded booking statuses
- **Slot Selector**: Interactive time slot picker
- **Booking Steps**: 5-step visual progress indicator with icons and completion state (Pilih Olahraga → Pilih Venue → Pilih Lapangan → Isi Data → Selesai)
- **Admin Layout**: Sidebar + topbar navigation
- **Install Prompt**: PWA installation banner

---

## API Reference

### Public Endpoints

```
GET  /api/availability?courtId=X&date=Y   - Check slot availability
POST /api/bookings                         - Create booking
GET  /api/bookings/[id]                    - Get booking details
GET  /api/payments/methods                 - Get payment methods
POST /api/payments/proof                   - Submit payment proof
```

### Admin Endpoints (require admin auth)

```
GET    /api/admin/bookings                 - List all bookings
PATCH  /api/admin/bookings/[id]/status     - Update booking status
GET    /api/admin/courts                   - List all courts
PATCH  /api/admin/courts                   - Update court
GET    /api/admin/pricing                  - List pricing rules
POST   /api/admin/pricing                  - Create pricing rule
PATCH  /api/admin/pricing                  - Update pricing rule
DELETE /api/admin/pricing                  - Delete pricing rule
POST   /api/admin/payments/[id]            - Confirm/reject payment
GET    /api/admin/notifications            - List notifications
PATCH  /api/admin/notifications            - Mark notification read
```

### Customer Endpoints (require customer auth)

```
GET  /api/customer/loyalty                 - Get loyalty dashboard
POST /api/customer/loyalty                 - Redeem reward
```

### Auth Endpoints

```
POST /api/auth/admin/login                 - Admin login
POST /api/auth/admin/logout                - Admin logout
POST /api/auth/customer/register           - Customer register
POST /api/auth/customer/login              - Customer login
POST /api/auth/customer/logout             - Customer logout
GET  /api/auth/session                     - Get current session
```

---

## Testing Checklist

### Public Pages

- [ ] Homepage loads with hero, sports, features
- [ ] Sport cards link to correct booking pages
- [ ] Venue/court listing shows all active courts
- [ ] Court detail shows available slots
- [ ] Date picker works correctly
- [ ] Time slot selection works
- [ ] Booking form validates all fields
- [ ] Booking submission creates booking
- [ ] Success page shows booking code
- [ ] Mobile responsive on all pages

### Customer Auth

- [ ] Registration form works
- [ ] Duplicate email rejected
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Navbar shows user name when logged in
- [ ] Profile page shows loyalty info
- [ ] Logout clears session

### Loyalty Points

- [ ] Points awarded on booking confirmation
- [ ] Tier upgrade triggers correctly
- [ ] Reward catalog displays
- [ ] Reward redemption works
- [ ] Points balance updates after redemption
- [ ] Transaction history shows

### Admin

- [ ] Admin login page works
- [ ] Invalid credentials show error
- [ ] Dashboard shows statistics
- [ ] Booking list loads with data
- [ ] Confirm booking works + awards loyalty points
- [ ] Reject booking works
- [ ] Court management works
- [ ] Pricing management works
- [ ] Notifications display correctly
- [ ] Unauthenticated access redirects to login

### Mobile

- [ ] All pages scroll properly
- [ ] Buttons are tap-friendly
- [ ] Forms work on mobile keyboards
- [ ] Navigation hamburger works
- [ ] Cards stack vertically
- [ ] No horizontal overflow

### PWA

- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] Offline page shows when disconnected
- [ ] Manifest loads correctly

---

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_PROVIDER=mock
# NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# NEXT_PUBLIC_APP_NAME=Lapangin
# JWT_SECRET=your-production-secret
```

### Environment Variables

```env
DATABASE_PROVIDER=mock          # or google_sheets or postgres
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lapangin
JWT_SECRET=lapangin-secret-key-change-in-production
```

---

## Migration to PostgreSQL

When ready for production database:

1. Set `DATABASE_PROVIDER=postgres`
2. Run `supabase/schema.sql` against your PostgreSQL database
3. Set `DATABASE_URL` environment variable
4. The app automatically uses `PostgresAdapter`

The adapter pattern ensures zero code changes in UI or API routes.

---

_Last updated: 2026-06-24_
_Version: 1.0.0 — Full MVP with Loyalty System_
