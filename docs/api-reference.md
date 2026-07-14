# Lapangin API Reference

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/customer/register` | None | Register customer |
| POST | `/api/auth/customer/login` | None | Customer login |
| POST | `/api/auth/customer/logout` | customer_token | Customer logout |
| POST | `/api/auth/admin/login` | None | Admin login |
| POST | `/api/auth/admin/logout` | admin_token | Admin logout |
| POST | `/api/auth/owner/login` | None | Owner login |
| POST | `/api/auth/owner/logout` | owner_token | Owner logout |
| POST | `/api/auth/owner/register` | None | Register owner |
| GET  | `/api/auth/session` | Cookie | Get current session |

## Public

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sports` | None | List active sports |
| GET | `/api/sports/by-area/{areaId}` | None | Sports by area |
| GET | `/api/venues` | None | List active venues |
| GET | `/api/courts` | None | List active courts |
| GET | `/api/areas` | None | List areas |
| GET | `/api/search/courts` | None | Search courts with availability |
| GET | `/api/search/courts/{courtId}` | None | Court detail |
| GET | `/api/availability` | None | Court availability (REST) |
| GET | `/api/availability/stream` | None | SSE stream of availability updates |
| GET | `/api/reviews` | None | Public reviews |
| POST | `/api/reviews` | None | Submit a review |
| GET | `/api/weather` | None | Weather for area |
| GET | `/api/weather/rain-check` | None | Rain discount for venue |
| GET | `/api/pricing/calculate` | None | Calculate booking price |
| GET | `/api/payments/methods` | None | List payment methods |
| POST | `/api/payments/proof` | customer_token | Submit payment proof |
| POST | `/api/uploads/proof` | None | Upload payment proof image |
| POST | `/api/bookings` | None | Create booking |
| POST | `/api/bookings/recurring` | None | Create recurring booking |
| GET  | `/api/bookings/{id}` | None | Get booking detail |
| POST | `/api/bookings/{id}/cancel` | None | Cancel booking |
| GET  | `/api/bookings/{id}/invoice` | None | Get booking invoice |
| POST | `/api/bookings/{id}/notify` | None | Send booking notification |

## Customer

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/api/customer/profile` | customer_token | Get profile |
| PUT  | `/api/customer/profile` | customer_token | Update profile |
| POST | `/api/customer/change-password` | customer_token | Change password |
| GET  | `/api/customer/bookings` | customer_token | List customer's bookings |
| GET  | `/api/customer/favorites` | customer_token | List favorite venues |
| POST | `/api/customer/favorites` | customer_token | Add favorite |
| DELETE | `/api/customer/favorites` | customer_token | Remove favorite |
| GET  | `/api/customer/loyalty` | customer_token | Loyalty points & transactions |
| POST | `/api/customer/loyalty` | customer_token | Redeem loyalty reward |
| GET  | `/api/customer/reviews` | customer_token | List customer's reviews |
| GET  | `/api/customer/support` | customer_token | List support tickets |
| POST | `/api/customer/support` | customer_token | Submit support ticket |
| GET  | `/api/referrals` | customer_token | List referrals |
| POST | `/api/referrals` | customer_token | Generate referral code |
| PATCH | `/api/referrals` | None | Apply referral code |
| GET  | `/api/gamification/achievements` | customer_token | List achievements |

## Owner

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/api/owner/venues` | owner_token | List owner's venues |
| POST   | `/api/owner/venues` | owner_token | Register venue |
| PUT    | `/api/owner/venues` | owner_token | Update venue |
| DELETE | `/api/owner/venues` | owner_token | Delete venue |
| GET    | `/api/owner/venues/rain-config` | owner_token | Get rain discount config |
| PUT    | `/api/owner/venues/rain-config` | owner_token | Update rain discount config |
| GET    | `/api/owner/pricing` | owner_token | List pricing rules |
| POST   | `/api/owner/pricing` | owner_token | Create pricing rule |
| PUT    | `/api/owner/pricing` | owner_token | Update pricing rule |
| DELETE | `/api/owner/pricing` | owner_token | Delete pricing rule |
| GET    | `/api/owner/stats` | owner_token | Dashboard statistics |
| GET    | `/api/owner/analytics` | owner_token | Analytics data |

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/bookings` | admin_token | List all bookings |
| PATCH | `/api/admin/bookings/{id}/status` | admin_token | Update booking status |
| GET | `/api/admin/courts` | admin_token | List all courts |
| PATCH | `/api/admin/courts` | admin_token | Update court |
| GET | `/api/admin/venues` | admin_token | List all venues |
| PATCH | `/api/admin/venues` | admin_token | Update venue |
| PATCH | `/api/admin/venues/{id}` | admin_token | Update venue by ID |
| GET | `/api/admin/customers` | admin_token | List customers |
| GET | `/api/admin/owners` | admin_token | List venue owners |
| PATCH | `/api/admin/owners/{id}` | admin_token | Update owner status |
| GET | `/api/admin/payments` | admin_token | List pending payments |
| POST | `/api/admin/payments/{id}` | admin_token | Confirm/reject payment |
| PATCH | `/api/admin/payments/{id}` | admin_token | Update payment status |
| GET | `/api/admin/pricing` | admin_token | List all pricing rules |
| POST | `/api/admin/pricing` | admin_token | Create pricing rule |
| PATCH | `/api/admin/pricing` | admin_token | Update pricing rule |
| DELETE | `/api/admin/pricing` | admin_token | Delete pricing rule |
| GET | `/api/admin/reviews` | admin_token | List all reviews |
| PATCH | `/api/admin/reviews/{id}/moderate` | admin_token | Moderate review visibility |
| GET | `/api/admin/commission` | admin_token | Commission report |
| PATCH | `/api/admin/commission` | admin_token | Update commission rate |
| GET | `/api/admin/analytics/revenue` | admin_token | Revenue analytics |
| GET | `/api/admin/cms` | admin_token | Get CMS content |
| PUT | `/api/admin/cms` | admin_token | Update CMS content |
| GET | `/api/admin/seo` | admin_token | Get SEO settings |
| PUT | `/api/admin/seo` | admin_token | Update SEO settings |
| GET | `/api/admin/support` | admin_token | List support tickets |
| POST | `/api/admin/support` | admin_token | Reply to support ticket |
| GET | `/api/admin/notifications` | admin_token | List notifications |
| PATCH | `/api/admin/notifications` | admin_token | Mark notification as read |
| GET | `/api/admin/notifications/whatsapp` | admin_token | WhatsApp notification log |
| POST | `/api/admin/notifications/whatsapp` | admin_token | Send WhatsApp notification |

---

## Example: Customer Login

```bash
POST /api/auth/customer/login
Content-Type: application/json

{"email": "user@example.com", "password": "secret123"}

# Response 200:
{
  "success": true,
  "user": {
    "userId": "cust_abc123",
    "role": "customer",
    "name": "Budi",
    "email": "user@example.com",
    "loyaltyPoints": 150,
    "loyaltyTier": "silver"
  }
}
# Sets cookie: customer_token=eyJhbG...
```

## Example: Check Availability

```bash
GET /api/availability?courtId=court_1&date=2026-07-15&openTime=06:00&closeTime=23:00

# Response 200:
{
  "data": [
    {"startTime": "06:00", "endTime": "07:00", "isAvailable": true},
    {"startTime": "07:00", "endTime": "08:00", "isAvailable": false}
  ],
  "total": 17,
  "available": 16
}
```

## Example: SSE Real-time Availability

```bash
GET /api/availability/stream?courtId=court_1&date=2026-07-15

# Response (text/event-stream):
# data: {"type":"snapshot","slots":[...],"timestamp":1710000000000}
# data: {"type":"heartbeat","timestamp":1710000005000}
# data: {"type":"update","slots":[...],"timestamp":1710000012000}
```

## Example: Create Booking

```bash
POST /api/bookings
Content-Type: application/json

{
  "customerName": "Budi Santoso",
  "customerPhone": "08123456789",
  "customerEmail": "budi@example.com",
  "courtId": "court_1",
  "venueId": "venue_1",
  "sportId": "sport_badminton",
  "bookingDate": "2026-07-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "durationMinutes": 60
}

# Response 201:
{
  "id": "bk_abc123",
  "bookingCode": "LPG-20260715-XYZ",
  "customerName": "Budi Santoso",
  "bookingStatus": "waiting_payment",
  "totalPrice": 75000,
  "expiresAt": "2026-07-15T02:00:00Z"
}
```

## Example: Admin Confirm Payment

```bash
POST /api/admin/payments/bk_abc123
Cookie: admin_token=eyJhbG...
Content-Type: application/json

{"action": "confirm"}

# Response 200:
{
  "success": true,
  "booking": {
    "id": "bk_abc123",
    "bookingStatus": "paid",
    "paymentStatus": "paid"
  }
}
```
