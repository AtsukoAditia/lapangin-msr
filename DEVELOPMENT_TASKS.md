# Development Tasks — From Start to Running Well

## Stage 0 — Persiapan Project ✅

- [x] Buat project Next.js + TypeScript.
- [x] Setup Tailwind CSS.
- [x] Setup alias import `@/*`.
- [x] Setup struktur folder.
- [x] Tambahkan `.env.example`.
- [x] Tambahkan `.clinerules`.
- [x] Tambahkan `.clineignore`.
- [x] Jalankan `npm run dev`.

Definition of Done:

- App bisa dibuka di localhost. ✅
- Tidak ada error TypeScript dasar. ✅
- Struktur folder sudah rapi. ✅

## Stage 1 — Static UI Public ✅

- [x] Homepage.
- [x] List olahraga (sport category page).
- [x] List venue/lapangan (per sport).
- [x] Detail lapangan (court detail with slot selector).
- [x] Booking date picker (SlotSelector component).
- [x] Slot jam (SlotSelector time grid).
- [x] Booking form (customer name, phone, email).
- [x] Booking success page.

Definition of Done:

- User bisa simulasi booking tanpa database. ✅
- Tampilan mobile responsive. ✅

## Stage 2 — Domain Types dan Mock Service ✅

- [x] Buat type `Sport`, `Venue`, `Court`, `Booking`, `PricingRule`.
- [x] Buat mock data.
- [x] Buat `BookingService`.
- [x] Buat `AvailabilityService`.
- [x] Buat `PricingService`.
- [x] Buat `MockAdapter` implementing `DatabaseAdapter`.
- [x] Adapter factory pattern (`mock` | `google_sheets` | `postgres`).
- [x] Wire services ke API routes (`/api/bookings`, `/api/availability`).

Definition of Done:

- UI tidak langsung membaca array mentah. ✅
- Semua data lewat service. ✅

## Stage 3 — Google Spreadsheet Adapter ✅

- [x] Install `google-spreadsheet` dan `google-auth-library`.
- [x] Implement `GoogleSheetsAdapter` with full CRUD.
- [x] Row-to-domain mappers (snake_case → camelCase).
- [x] `getSports`, `getVenues`, `getCourts`.
- [x] `getBookings`, `getBookingsByCourtAndDate`, `createBooking`, `updateBookingStatus`.
- [x] `getPricingRules`, `getBlockedSlots`.
- [x] `.env.example` sudah include `GOOGLE_SHEETS_*` variables.

> **Note:** Untuk menggunakan Google Sheets, user perlu:
>
> 1. Buat service account di Google Cloud.
> 2. Buat Google Spreadsheet dengan tab sesuai schema.
> 3. Share Spreadsheet ke email service account.
> 4. Set `DATABASE_PROVIDER=google_sheets` di `.env.local`.

Definition of Done:

- Booking dari web tersimpan ke Spreadsheet. ✅ (when configured)
- Admin bisa melihat data booking dari Spreadsheet. ✅ (when configured)

## Stage 4 — Admin CMS Dasar ✅

- [x] Dashboard admin (statistik overview).
- [x] Booking list (filter status, pagination).
- [x] Booking detail (view all info).
- [x] Confirm booking (admin action).
- [x] Reject booking (admin action).
- [x] Courts management (list, edit name/price/active).
- [x] Pricing management (CRUD aturan harga).
- [x] Settings page (app info, jam operasional, database info).

> **Note:** Blocked slots management ditunda ke Stage 5 bersama fitur anti double-booking.

Definition of Done:

- Admin bisa mengatur booking dan data utama. ✅
- Owner bisa menjalankan operasional dasar. ✅

### Arsitektur Admin CMS:

- **Admin Layout** (`src/components/admin/AdminLayout.tsx`) — Sidebar responsive + topbar.
- **Admin Dashboard** (`src/app/admin/page.tsx`) — Stats cards, booking terbaru.
- **Admin Bookings** (`src/app/admin/bookings/page.tsx`) — List, detail modal, confirm/reject.
- **Admin Courts** (`src/app/admin/courts/page.tsx`) — List, inline edit.
- **Admin Pricing** (`src/app/admin/pricing/page.tsx`) — CRUD aturan harga.
- **Admin Settings** (`src/app/admin/settings/page.tsx`) — Pengaturan umum.
- **API Routes:**
  - `GET/POST /api/admin/bookings` — List & create booking.
  - `PATCH /api/admin/bookings/[id]/status` — Update status (confirm/reject).
  - `GET/PATCH /api/admin/courts` — List & update court.
  - `GET/POST/PATCH/DELETE /api/admin/pricing` — CRUD pricing rules.
- **Adapter methods:** `getBookingStats`, `updateCourt`, `getPricingRules`, `updatePricingRule`, `deletePricingRule`.

## Stage 5 — Anti Double Booking ✅

- [x] Validasi slot sebelum submit (SlotSelector menampilkan slot terpesan).
- [x] Validasi ulang di server (`validateBookingInput` + `BookingService.createBooking`).
- [x] Cek bentrok berdasarkan court, date, start, end, status aktif.
- [x] Error 409 (CONFLICT) dikembalikan ke UI jika slot sudah dipesan.
- [x] Booking form menampilkan pesan konflik + tombol "Pilih Jam Lain".
- [x] Tambahkan `AuditLogEntry` type & adapter methods.
- [x] Semua mutasi booking tercatat (`logAudit` dipanggil di service layer).
- [x] Comprehensive server-side validation (`validateBookingInput`).

Definition of Done:

- Slot yang sudah pending/confirmed/waiting_payment/paid tidak bisa dibooking ulang. ✅
- Semua mutasi booking tercatat di audit log. ✅
- Server mengembalikan 409 untuk double-booking. ✅
- UI menampilkan error konflik dengan aksi kembali ke slot selector. ✅

### Arsitektur Anti Double Booking:

- **Validator** (`src/lib/validators/booking-validator.ts`) — Zod schema + `validateBookingInput()` helper.
- **BookingService** (`src/lib/services/booking-service.ts`) — Re-check ketersediaan sebelum insert + `logAudit()`.
- **API Route** (`src/app/api/bookings/route.ts`) — Server-side validation, HTTP 409 on conflict.
- **UI** (`src/app/(public)/booking/form/page.tsx`) — Conflict error banner + "Pilih Jam Lain" button.
- **Domain types** (`src/lib/types/domain.ts`) — `AuditLogEntry` type.
- **DatabaseAdapter** — `logAudit()` + `getAuditLogs()` methods.
- **Active blocking statuses:** `pending`, `waiting_payment`, `paid`, `confirmed`.
- **Double-booking check:** `courtId + bookingDate + startTime + endTime` overlap.

## Stage 6 — Payment Manual ✅

- [x] Tambahkan metode pembayaran manual (BCA, BNI, GoPay, OVO, Dana, QRIS).
- [x] Persiapkan juga untuk metode pembayaran otomatis untuk https://ipaymu.com/ (PaymentMethod.gateway stub).
- [x] Upload bukti pembayaran (image/file) via `/api/payments/proof`.
- [x] Status `waiting_payment`, `paid`, `confirmed`.
- [x] Admin confirm/reject payment via `/api/admin/payments/[id]`.
- [x] Template instruksi pembayaran (bank details, steps, amount).

Definition of Done:

- Booking bisa melewati alur pembayaran manual. ✅

### Arsitektur Payment Manual:

- **Domain types** (`src/lib/types/domain.ts`) — `PaymentMethod`, `PaymentInstruction`, `paymentProofUrl` & `paymentNotes` pada Booking.
- **PaymentService** (`src/lib/services/payment-service.ts`) — `getPaymentMethods()`, `getPaymentInstruction()`, `uploadProof()`, `confirmPayment()`, `rejectPayment()`.
- **DatabaseAdapter** (`src/lib/adapters/database-adapter.ts`) — `getPaymentMethods()`, `getPaymentMethodBySlug()`.
- **MockAdapter** — 6 payment methods dengan instruksi lengkap.
- **GoogleSheetsAdapter** — Read payment_methods sheet + update booking proof/status.
- **API Routes:**
  - `GET /api/payments/methods` — Ambil semua metode pembayaran.
  - `POST /api/payments/proof` — Upload bukti pembayaran (FormData with image/file).
  - `POST /api/admin/payments/[id]` — Admin confirm/reject payment.
  - `GET /api/bookings/[id]` — Ambil detail booking (untuk success page refresh).
- **Booking success page** (`src/app/(public)/booking/success/page.tsx`) — 3-step payment flow: pilih metode → instruksi → upload bukti → tunggu konfirmasi.

## Stage 7 — Notification ✅

- [x] Email notification (template-based SMTP stub).
- [x] WhatsApp template redirect (wa.me deep link).
- [x] Web push basic (Service Worker push event registration).
- [x] Notification log (disimpan di spreadsheet / adapter).
- [x] Admin notification log page.
- [x] Integrasi notifikasi ke booking flow (create, confirm, reject, cancel).
- [x] Admin alert saat booking baru masuk.

> **Note:** Reminder sebelum main ditunda ke versi berikutnya (butuh cron job).

Definition of Done:

- User menerima minimal satu kanal notifikasi (WhatsApp redirect). ✅
- Admin bisa melihat log notifikasi. ✅

### Arsitektur Notification:

- **Domain types** (`src/lib/types/domain.ts`) — `NotificationLog`, `NotificationChannel`, `NotificationType`, `NotificationStatus`.
- **DatabaseAdapter** (`src/lib/adapters/database-adapter.ts`) — `getNotificationLogs()`, `createNotificationLog()`, `updateNotificationStatus()`, `getNotificationLogCount()`.
- **NotificationService** (`src/lib/services/notification-service.ts`) — `sendNotification()`, `sendBookingCreated()`, `sendBookingConfirmation()`, `sendBookingRejection()`, `sendBookingCancellation()`, `sendAdminNewBookingAlert()`.
- **Notification templates** (`src/lib/notification-templates.ts`) — `getEmailTemplate()`, `getWhatsAppMessage()`, `getPushPayload()`.
- **Adapter implementations:**
  - `MockAdapter` — In-memory log storage.
  - `GoogleSheetsAdapter` — `notification_logs` sheet CRUD.
  - `PostgresAdapter` — `notification_logs` table CRUD.
- **API Routes:**
  - `GET /api/admin/notifications` — List notification logs (with pagination, filters).
- **Admin UI:**
  - `Admin Notifications Page` (`src/app/admin/notifications/page.tsx`) — List, filters, status badges, stats.
  - `AdminLayout` — Added "Notifikasi" nav link.
- **Booking flow integration** (`src/lib/services/booking-service.ts`):
  - `createBooking()` → sendBookingCreated + sendAdminNewBookingAlert.
  - `confirmBooking()` → sendBookingConfirmation.
  - `rejectBooking()` → sendBookingRejection.
  - `cancelBooking()` → sendBookingCancellation.
  - Semua notification non-blocking (try/catch, tidak mengganggu booking flow).

## Stage 8 — PWA ✅

- [x] Enhance manifest.json (display: standalone, start_url, theme_color, icons, shortcuts).
- [x] PWA icons (icon-192.png, icon-512.png) — placeholder generated.
- [x] Service Worker (`public/sw.js`) — cache-first for images, stale-while-revalidate for static, network-first for HTML, push notification support.
- [x] Offline fallback page (`/offline`) — React client component + static HTML (`public/offline.html`).
- [x] Service Worker registration (`src/components/pwa/ServiceWorkerRegistration.tsx`).
- [x] Install prompt component (`src/components/pwa/InstallPrompt.tsx`) — detects beforeinstallprompt, shows install banner.
- [x] PWA meta tags in layout (apple-web-app, theme-color, apple-touch-icon, viewport).
- [x] Build tested successfully.

Definition of Done:

- Aplikasi bisa di-install dari browser. ✅
- Tampilan mobile terasa seperti app (standalone mode). ✅
- Offline fallback page muncul saat tidak ada koneksi. ✅
- Service worker register otomatis. ✅
- Install prompt muncul di browser yang support. ✅

## Stage 9 — Admin Authentication ✅

- [x] JWT-based authentication system (`src/lib/auth/jwt.ts`).
- [x] Auth context provider (`src/lib/auth/context.tsx`) — React context for admin & customer session.
- [x] Admin login page (`src/app/admin/login/page.tsx`) — Dark sporty theme.
- [x] Admin login API (`src/app/api/auth/admin/login/route.ts`) — Validates admin credentials.
- [x] Admin logout API (`src/app/api/auth/admin/logout/route.ts`).
- [x] Session API (`src/app/api/auth/session/route.ts`) — Returns current user from JWT cookie.
- [x] Admin route protection — AdminLayout checks session, redirects to `/admin/login`.
- [x] Admin sidebar shows user info + logout button.
- [x] Default admin account: `admin@arenabook.com` / `admin123`.

### Arsitektur Admin Auth:

- **JWT utility** (`src/lib/auth/jwt.ts`) — `signJWT()`, `verifyJWT()`, `hashPassword()`, `comparePassword()` (SHA-256).
- **Auth context** (`src/lib/auth/context.tsx`) — `AuthProvider`, `useAuth()` hook, `User` type (id, name, email, role).
- **Admin login page** (`src/app/admin/login/page.tsx`) — Email + password form, dark gradient background.
- **API routes:**
  - `POST /api/auth/admin/login` — Validate credentials, set JWT cookie (httpOnly, 24h expiry).
  - `POST /api/auth/admin/logout` — Clear JWT cookie.
  - `GET /api/auth/session` — Return current user from JWT cookie.
- **AdminLayout** (`src/components/admin/AdminLayout.tsx`) — Checks session on mount, redirects if not admin.
- **Cookie:** `lapangin_session` — httpOnly, sameSite=lax, maxAge=86400.

Definition of Done:

- Admin harus login sebelum akses dashboard. ✅
- Admin login page tampil dengan tema sporty. ✅
- Session tersimpan di cookie httpOnly (aman). ✅
- Admin bisa logout. ✅
- Redirect ke login jika session invalid. ✅

## Stage 10 — Customer Registration, Login & Loyalty Points ✅

- [x] Customer register page (`src/app/(auth)/register/page.tsx`) — Name, email, phone, password.
- [x] Customer login page (`src/app/(auth)/login/page.tsx`) — Email + password.
- [x] Customer profile page (`src/app/(auth)/profile/page.tsx`) — Shows loyalty points, tier, stats.
- [x] Customer register API (`src/app/api/auth/customer/register/route.ts`) — Creates customer, hashes password.
- [x] Customer login API (`src/app/api/auth/customer/login/route.ts`) — Validates, sets JWT cookie.
- [x] Customer logout API (`src/app/api/auth/customer/logout/route.ts`).
- [x] Loyalty points API (`src/app/api/customer/loyalty/route.ts`) — GET (balance + history), POST (redeem rewards).
- [x] Loyalty points earned on booking confirmation (10 points per Rp10,000 spent).
- [x] Loyalty reward types:
  - Diskon Rp10,000 (500 points)
  - Diskon Rp25,000 (1,000 points)
  - Gratis 1 jam (2,000 points)
  - Gratis 2 jam (3,500 points)
  - Gratis lapangan (5,000 points)
- [x] Domain types: `Customer`, `LoyaltyPoints`, `LoyaltyReward`, `LoyaltyRedemption`, `LoyaltyTier`.
- [x] Adapter methods: `getCustomerByEmail`, `createCustomer`, `getCustomerLoyaltyPoints`, `getLoyaltyRedemptions`, `createLoyaltyRedemption`, `updateLoyaltyPoints`.
- [x] Auth context supports both admin and customer roles.
- [x] Navbar shows user menu (login/register) or profile (if authenticated).
- [x] Full test: register → login → book → confirm → earn points → check profile → redeem.

### Arsitektur Auth & Loyalty:

- **Domain types** (`src/lib/types/domain.ts`):
  - `Customer` — id, name, email, phone, passwordHash, role, loyaltyPoints, loyaltyTier, totalSpent, totalBookings, createdAt, updatedAt.
  - `LoyaltyReward` — id, name, description, pointsRequired, rewardType, rewardValue, isActive.
  - `LoyaltyRedemption` — id, customerId, rewardId, pointsSpent, status, createdAt.
  - `LoyaltyTier` — bronze (< 500pts), silver (< 2000pts), gold (< 5000pts), platinum (>= 5000pts).
- **Auth JWT** (`src/lib/auth/jwt.ts`) — SHA-256 password hashing, JWT sign/verify.
- **Auth context** (`src/lib/auth/context.tsx`) — `useAuth()` returns { user, isAdmin, isCustomer, loading }.
- **API routes:**
  - `POST /api/auth/customer/register` — Create customer account.
  - `POST /api/auth/customer/login` — Authenticate customer.
  - `POST /api/auth/customer/logout` — Clear session.
  - `GET /api/customer/loyalty` — Get loyalty balance, tier, history, available rewards.
  - `POST /api/customer/loyalty` — Redeem a reward (deducts points).
- **Booking integration** (`src/app/api/admin/bookings/[id]/status/route.ts`):
  - When booking confirmed → earn loyalty points (10 pts per Rp10,000).
  - Customer tier auto-updates based on total points.
- **UI pages:**
  - `/register` — Sporty gradient hero, register form with benefits description.
  - `/login` — Clean login form, links to register.
  - `/profile` — Points balance card, tier badge, booking stats, redemption history, available rewards.
  - Navbar — User menu dropdown or auth buttons.
- **Mock data** (`src/lib/mock-data.ts`) — 5 loyalty rewards with prices and descriptions.
- **Password handling:**
  - Register: SHA-256 hash before storing.
  - Login: SHA-256 hash input, compare with stored hash.
  - Both admin and customer use same hashing (consistent).

Definition of Done:

- Customer bisa daftar akun baru. ✅
- Customer bisa login. ✅
- Customer melihat profil & poin di `/profile`. ✅
- Poin otomatis bertambah saat booking dikonfirmasi admin. ✅
- Tier otomatis update (Bronze → Silver → Gold → Platinum). ✅
- Customer bisa tukar poin dengan reward. ✅
- Admin login terpisah dari customer. ✅
- Navbar menampilkan status login. ✅

## Stage 11 — UI/UX Optimization (Sport Theme) ✅

- [x] Homepage hero: gradient sporty teal-to-green with bold typography.
- [x] Sport cards: hover effects, gradient overlays, emoji icons.
- [x] CTA buttons: gradient backgrounds, hover animations.
- [x] Auth pages: matching sporty gradients, glassmorphism cards.
- [x] Admin login: dark gradient theme (distinct from customer).
- [x] Mobile responsive: all pages optimized for 360px+.
- [x] Desktop responsive: max-width containers, proper spacing.
- [x] Status badges: colored pills for booking/payment status.
- [x] Empty states: helpful messages with action buttons.
- [x] PWA install banner: non-intrusive bottom sheet.
- [x] Consistent color palette: teal (#00897B), green (#10B981), dark (#0D1117).

## Stage 12 — Deployment Vercel

- [ ] Push ke GitHub.
- [ ] Import project ke Vercel.
- [ ] Set environment variables.
- [ ] Test preview deployment.
- [ ] Test production deployment.
- [ ] Cek API routes di production.

Definition of Done:

- Demo URL Vercel bisa dipakai.
- Booking dari demo masuk ke Spreadsheet.

## Stage 13 — PostgreSQL Migration Preparation

- [ ] Buat schema SQL.
- [ ] Buat Prisma/Drizzle schema.
- [ ] Buat `PostgresAdapter`.
- [ ] Buat migration scripts.
- [ ] Buat import dari Spreadsheet ke PostgreSQL.
- [ ] Test adapter swap.

Definition of Done:

- ENV bisa memilih adapter:
  - `DATABASE_PROVIDER=google_sheets`
  - `DATABASE_PROVIDER=postgres`
- Logic aplikasi tidak berubah saat database diganti.

## Stage 14 — Production Readiness

- [ ] Rate limit booking.
- [ ] Logging.
- [ ] Backup data.
- [ ] Terms & policy.
- [ ] Security check.
- [ ] Performance optimization.

Definition of Done:

- Aplikasi layak dipakai owner usaha kecil.
