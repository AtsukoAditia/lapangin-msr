# Stage 8: UI Optimization & Loyalty Points Module

## Overview

This stage covers comprehensive UI/UX optimization for both customer-facing and admin pages, along with a new customer loyalty points system.

---

## 1. UI Optimization Summary

### Customer Pages

| Page                                     | Changes                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Homepage** (`/`)                       | Sporty gradient hero, animated elements, sport category cards with hover effects, floating badges, trust indicators |
| **Booking Step 1** (`/booking`)          | Progress stepper component, animated venue cards with sport icons, responsive grid                                  |
| **Booking Step 2** (`/booking/[sport]`)  | Venue card grid with gradient headers, sport-themed badges                                                          |
| **Booking Step 3** (`/booking/form`)     | Multi-section form with visual icons, improved date/time selectors, mobile-first layout                             |
| **Booking Success** (`/booking/success`) | Celebration confetti effect, ticket-style booking summary, gradient CTA buttons, auto-fill from URL params          |

### Admin Pages

| Page                             | Changes                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Dashboard** (`/admin`)         | Gradient welcome banner, stat cards with hover animations, quick action buttons, real-time stats            |
| **Bookings** (`/admin/bookings`) | Gradient header with stats, filter chips with counts, status-colored booking cards, icon-enhanced info grid |
| **Login** (`/admin/login`)       | Already optimized with gradient background                                                                  |

### Shared Components

| Component      | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| `BookingSteps` | Reusable 5-step progress indicator with icons, labels, and responsive design |

### Design System

- **Gradients**: Indigo → Purple → Pink (primary), Blue → Cyan (secondary), Emerald → Teal (success)
- **Cards**: Rounded-2xl corners, subtle shadows, hover lift effects
- **Buttons**: Gradient backgrounds, icon labels, loading states
- **Status badges**: Color-coded by booking status with bold text
- **Mobile-first**: All layouts use responsive grids, stacked on mobile

---

## 2. Loyalty Points Module

### Concept

Pelanggan yang terdaftar dapat mengumpulkan poin dari setiap transaksi booking. Poin dapat ditukarkan untuk:

- **Potongan harga** lapangan (diskon %)
- **Bonus jam** lapangan (extra time)
- **Gratis lapangan** (free booking)

### Points Earning Rules

| Condition                  | Points        |
| -------------------------- | ------------- |
| Setiap Rp 10.000 transaksi | 1 poin        |
| Booking pertama kali       | 10 poin bonus |
| Review/feedback            | 5 poin bonus  |

### Points Redemption

| Reward                       | Points Required |
| ---------------------------- | --------------- |
| Diskon 10% (maks Rp 50.000)  | 100 poin        |
| Diskon 20% (maks Rp 100.000) | 200 poin        |
| Bonus 1 jam                  | 150 poin        |
| Gratis 1 jam (weekday)       | 300 poin        |
| Gratis 1 jam (weekend)       | 500 poin        |

### Database Schema (Loyalty)

#### `loyalty_transactions` sheet

| Column      | Description                              |
| ----------- | ---------------------------------------- |
| id          | Unique transaction ID                    |
| customerId  | Customer email/user ID                   |
| bookingId   | Related booking ID (optional)            |
| type        | `earn` or `redeem`                       |
| points      | Points amount (+ for earn, - for redeem) |
| description | Transaction description                  |
| createdAt   | ISO timestamp                            |

#### `customers` sheet additions

| Column         | Description                              |
| -------------- | ---------------------------------------- |
| email          | Customer email (primary key for loyalty) |
| passwordHash   | Hashed password                          |
| name           | Customer name                            |
| phone          | Customer phone                           |
| totalPoints    | Current available points                 |
| lifetimePoints | Total points ever earned                 |
| memberSince    | Registration date                        |
| memberTier     | `bronze`, `silver`, `gold`, `platinum`   |

### Member Tiers

| Tier        | Lifetime Points | Perks                                     |
| ----------- | --------------- | ----------------------------------------- |
| 🥉 Bronze   | 0 - 499         | Basic earning rate                        |
| 🥈 Silver   | 500 - 1,499     | 1.2x points multiplier                    |
| 🥇 Gold     | 1,500 - 4,999   | 1.5x points multiplier + priority booking |
| 💎 Platinum | 5,000+          | 2x points multiplier + exclusive rewards  |

### API Endpoints

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/api/auth/customer/register` | Register new customer         |
| POST   | `/api/auth/customer/login`    | Customer login                |
| POST   | `/api/auth/customer/logout`   | Customer logout               |
| GET    | `/api/customer/loyalty`       | Get loyalty balance & history |
| POST   | `/api/customer/loyalty`       | Redeem points                 |

### Pages

| Page     | URL         | Description                                         |
| -------- | ----------- | --------------------------------------------------- |
| Register | `/register` | Customer registration form                          |
| Login    | `/login`    | Customer login form                                 |
| Profile  | `/profile`  | Loyalty dashboard with points, tier, and redemption |

### Integration with Booking

When a booking is confirmed (`status = confirmed`):

1. Calculate points: `Math.floor(totalPrice / 10000)`
2. Apply tier multiplier
3. Create `earn` loyalty transaction
4. Update customer's `totalPoints` and `lifetimePoints`
5. Check and update tier if threshold crossed

---

## 3. Admin Authentication

### Flow

1. Admin visits any `/admin/*` page
2. `AdminLayout` checks session via `/api/auth/session`
3. If no valid admin session → redirect to `/admin/login`
4. Admin logs in with email + password
5. JWT token set in HTTP-only cookie
6. All admin API routes verify the JWT

### Admin Credentials (Demo)

```
Email: admin@lapangin.id
Password: admin123
```

### Security

- JWT tokens with 24h expiry
- HTTP-only cookies (not accessible via JavaScript)
- Server-side token verification on every admin request
- Separate admin and customer auth contexts

---

## 4. File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Customer login
│   │   ├── register/page.tsx       # Customer registration
│   │   └── profile/page.tsx        # Loyalty dashboard
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── page.tsx                # Admin dashboard (optimized)
│   │   ├── bookings/page.tsx       # Admin bookings (optimized)
│   │   └── ...
│   ├── (public)/
│   │   ├── booking/page.tsx        # Step 1 (optimized)
│   │   ├── booking/[sport]/page.tsx # Step 2 (optimized)
│   │   ├── booking/form/page.tsx   # Step 3 (optimized)
│   │   └── booking/success/page.tsx # Step 5 (optimized)
│   └── page.tsx                    # Homepage (optimized)
├── components/
│   ├── booking/BookingSteps.tsx    # Reusable progress stepper
│   ├── admin/AdminLayout.tsx       # Admin layout with auth guard
│   └── ui/Navbar.tsx               # Updated with auth links
├── lib/
│   ├── auth/
│   │   ├── context.tsx             # Auth context provider
│   │   └── jwt.ts                  # JWT utilities
│   └── ...
└── ...
```

---

## 5. Testing Checklist

### Customer Flow

- [ ] Homepage loads with sport categories
- [ ] Click sport → venue list displays
- [ ] Click venue → court detail with slot selector
- [ ] Select slot → booking form
- [ ] Submit booking → success page with celebration
- [ ] Customer can register
- [ ] Customer can login
- [ ] Customer can view profile with points

### Admin Flow

- [ ] Admin login page renders
- [ ] Invalid credentials show error
- [ ] Valid credentials redirect to dashboard
- [ ] Dashboard shows stats and quick actions
- [ ] Bookings page shows filter chips
- [ ] Booking actions (confirm/reject/complete) work
- [ ] Unauthenticated access redirects to login

### Loyalty Points

- [ ] Points earned on confirmed booking
- [ ] Points balance displays on profile
- [ ] Points redemption works
- [ ] Member tier upgrades correctly
- [ ] Tier multiplier applies to earning

### Responsive Design

- [ ] All pages look good on 360px width
- [ ] All pages look good on 768px width
- [ ] All pages look good on 1440px width
- [ ] Touch targets are at least 44px
- [ ] Text is readable on all screen sizes
