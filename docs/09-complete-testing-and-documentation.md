# Lapangin - Complete Testing & Documentation

## Overview

Lapangin is a web-based PWA sports court booking system with comprehensive features across 9 stages of development.

---

## Feature Summary by Stage

### Stage 1: App Shell & Layout ✅

- Next.js App Router with TypeScript
- Tailwind CSS + shadcn/ui style components
- Mobile-first responsive layout
- PWA manifest and service worker

### Stage 2: Public Homepage ✅

- Hero section with sports-themed design
- Sport category cards with icons
- Featured venues section
- Call-to-action buttons

### Stage 3: Court Listing ✅

- Browse by sport category
- Venue and court listing pages
- Court details (surface, capacity, price)

### Stage 4: Court Detail ✅

- Full court information display
- Available time slots
- Pricing breakdown

### Stage 5: Booking Flow ✅

- Multi-step booking form (BookingSteps component)
- Date and time slot selection
- Customer information form
- Price calculation with peak/off-peak rates
- Booking confirmation page

### Stage 6: Booking Success ✅

- Booking confirmation with booking code
- Payment instructions
- Status tracking

### Stage 7: Admin Dashboard ✅

- Protected admin routes (JWT middleware)
- Admin login page
- Dashboard with booking stats
- Booking management (confirm/reject)
- Court management
- Pricing management
- Notification center
- Settings page

### Stage 8: Advanced Features ✅

- Google Sheets adapter for demo data
- PostgreSQL adapter stub
- PWA offline support
- Payment proof upload
- Notification templates

### Stage 9: UI Optimization & Loyalty Module ✅

- Optimized desktop & mobile UI
- Customer registration & login
- Admin authentication protection
- Loyalty points system
- Points redemption for discounts

---

## API Endpoints

### Public APIs

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/bookings`         | Create new booking       |
| GET    | `/api/bookings/[id]`    | Get booking by ID        |
| GET    | `/api/availability`     | Check court availability |
| GET    | `/api/payments/methods` | Get payment methods      |
| POST   | `/api/payments/proof`   | Upload payment proof     |

### Auth APIs

| Method | Endpoint                      | Description           |
| ------ | ----------------------------- | --------------------- |
| POST   | `/api/auth/customer/register` | Customer registration |
| POST   | `/api/auth/customer/login`    | Customer login        |
| POST   | `/api/auth/admin/login`       | Admin login           |
| GET    | `/api/auth/session`           | Get current session   |
| POST   | `/api/auth/customer/logout`   | Customer logout       |
| POST   | `/api/auth/admin/logout`      | Admin logout          |

### Customer APIs

| Method | Endpoint                | Description                  |
| ------ | ----------------------- | ---------------------------- |
| GET    | `/api/customer/loyalty` | Get loyalty points & history |

### Admin APIs (Protected)

| Method   | Endpoint                          | Description               |
| -------- | --------------------------------- | ------------------------- |
| GET      | `/api/admin/bookings`             | List all bookings         |
| PATCH    | `/api/admin/bookings/[id]/status` | Update booking status     |
| GET/POST | `/api/admin/courts`               | List/create courts        |
| GET/POST | `/api/admin/pricing`              | List/create pricing rules |
| GET/POST | `/api/admin/notifications`        | List/create notifications |
| PATCH    | `/api/admin/payments/[id]`        | Update payment status     |

---

## Testing Results

### 1. Admin Login ✅

```bash
POST /api/auth/admin/login
# Input: {"email":"admin@lapangin.com","password":"admin123"}
# Result: 200 OK with session cookie set
```

### 2. Customer Registration ✅

```bash
POST /api/auth/customer/register
# Input: {"email":"test@example.com","password":"password123","name":"Test User","phone":"08123456789"}
# Result: 200 OK with JWT token
```

### 3. Customer Login ✅

```bash
POST /api/auth/customer/login
# Input: {"email":"test@example.com","password":"password123"}
# Result: 200 OK with JWT token
```

### 4. Loyalty Points ✅

```bash
GET /api/customer/loyalty
# Result: 200 OK with points balance and transaction history
```

### 5. Booking Creation ✅

```bash
POST /api/bookings
# Input: customer info, court, date, time
# Result: 201 with booking code (BK-XXXXXXXX)
```

### 6. Admin Booking Confirmation ✅

```bash
PATCH /api/admin/bookings/[id]/status
# Input: {"status":"confirmed"}
# Result: 200 OK with updated booking
```

### 7. Double Booking Prevention ✅

```bash
POST /api/bookings (same slot)
# Result: 409 CONFLICT - "Slot sudah dipesan atau diblokir"
```

### 8. Middleware Protection ✅

```bash
GET /admin (without auth)
# Result: 307 redirect to /admin/login
```

---

## Authentication System

### Admin Authentication

- **Login**: `/admin/login`
- **Default credentials**: `admin@lapangin.com` / `admin123`
- **JWT stored in**: `admin_token` cookie (HttpOnly, 8h expiry)
- **Middleware**: All `/admin/*` routes except `/admin/login` are protected

### Customer Authentication

- **Register**: `/register`
- **Login**: `/login`
- **JWT stored in**: `customer_token` cookie (HttpOnly, 7d expiry)
- **Profile**: `/profile` (shows loyalty points)

---

## Loyalty Points System

### How It Works

1. Customer registers an account
2. Makes a booking (can be anonymous or logged in)
3. When booking is confirmed as `completed` by admin, points are automatically awarded
4. Points calculation: `Math.floor(totalPrice / 10000)` (1 point per Rp10,000 spent)
5. Bonus: 100 points on first booking

### Point Redemption

- **500 points** → 10% discount on next booking
- **1000 points** → 1 hour free
- **2000 points** → 1 full session free (up to Rp200,000)

### Points Expiry

- Points expire after 12 months from earning date

### API Response

```json
{
  "points": 120,
  "tier": "bronze",
  "transactions": [
    {
      "id": "...",
      "type": "earned",
      "points": 18,
      "description": "Booking BK-XXXXXXXX",
      "createdAt": "2026-06-24T..."
    }
  ]
}
```

---

## Database Adapters

| Adapter       | Status    | Use Case              |
| ------------- | --------- | --------------------- |
| Mock Adapter  | ✅ Active | Local development     |
| Google Sheets | ✅ Ready  | Demo/small scale      |
| PostgreSQL    | ✅ Stub   | Production (Supabase) |

Switch via `DATABASE_PROVIDER` env var: `mock`, `google-sheets`, or `postgres`

---

## Pages Map

### Public Pages

| Page            | URL                                | Description             |
| --------------- | ---------------------------------- | ----------------------- |
| Homepage        | `/`                                | Hero + sport categories |
| Booking         | `/booking`                         | Choose sport            |
| Sport Courts    | `/booking/[sport]`                 | Courts by sport         |
| Court Detail    | `/booking/[sport]/[venue]/[court]` | Slots & booking         |
| Booking Form    | `/booking/form`                    | Fill details            |
| Booking Success | `/booking/success`                 | Confirmation            |
| Login           | `/login`                           | Customer login          |
| Register        | `/register`                        | Customer registration   |
| Profile         | `/profile`                         | Loyalty points          |
| Offline         | `/offline`                         | PWA offline page        |

### Admin Pages (Protected)

| Page          | URL                    | Description          |
| ------------- | ---------------------- | -------------------- |
| Admin Login   | `/admin/login`         | Admin authentication |
| Dashboard     | `/admin`               | Stats overview       |
| Bookings      | `/admin/bookings`      | Manage bookings      |
| Courts        | `/admin/courts`        | Manage courts        |
| Pricing       | `/admin/pricing`       | Manage pricing       |
| Notifications | `/admin/notifications` | Notification center  |
| Settings      | `/admin/settings`      | App settings         |

---

## Environment Variables

```env
DATABASE_PROVIDER=mock
ADMIN_EMAIL=admin@lapangin.com
ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key-here
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lapangin
```

---

## Running the Project

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

Open http://localhost:3000 to view the app.
