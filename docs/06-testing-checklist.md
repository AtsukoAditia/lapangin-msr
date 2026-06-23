# 06 — Testing Checklist

## Public User

- [x] Homepage tampil di mobile.
- [x] User bisa pilih olahraga.
- [x] User bisa pilih lapangan.
- [x] User bisa pilih tanggal.
- [x] Slot kosong tampil.
- [x] Slot terisi tidak tampil sebagai available.
- [x] User bisa submit booking.
- [x] Booking success tampil.
- [x] Booking code muncul.

## Admin

- [x] Admin bisa melihat daftar booking.
- [x] Admin bisa filter booking (by status).
- [x] Admin bisa confirm booking.
- [x] Admin bisa reject booking.
- [x] Admin bisa melihat detail booking (modal).
- [x] Admin bisa melihat lapangan.
- [x] Admin bisa edit lapangan (harga, kapasitas, status aktif).
- [x] Admin bisa melihat aturan harga.
- [x] Admin bisa tambah/edit/hapus aturan harga.
- [x] Admin dashboard menampilkan statistik.
- [x] Settings page menampilkan info aplikasi.

## Admin CMS API

- [x] GET /api/admin/bookings — list bookings.
- [x] PATCH /api/admin/bookings/[id]/status — update status.
- [x] GET /api/admin/courts — list courts.
- [x] PATCH /api/admin/courts — update court.
- [x] GET /api/admin/pricing — list pricing rules.
- [x] POST /api/admin/pricing — create pricing rule.
- [x] PATCH /api/admin/pricing — update pricing rule.
- [x] DELETE /api/admin/pricing — delete pricing rule.

## Booking Logic (Anti Double Booking — Stage 5)

- [x] Tidak bisa booking slot yang sudah pending/waiting_payment/paid/confirmed.
- [x] Server mengembalikan HTTP 409 (CONFLICT) saat double-booking terdeteksi.
- [x] Re-check ketersediaan dilakukan server-side sebelum insert booking.
- [x] Booking form menampilkan pesan error konflik yang jelas.
- [x] Tombol "Pilih Jam Lain" muncul pada error konflik dan navigasi kembali ke slot selector.
- [x] Slot terpesan muncul merah di SlotSelector (pre-check availability via API).
- [x] Comprehensive server-side validation (nama, HP, durasi, format waktu, masa lalu).
- [x] Audit log tercatat setiap booking created, confirmed, rejected, cancelled.
- [x] Tidak bisa booking di luar jam buka.
- [x] Tidak bisa booking lapangan nonaktif.
- [x] Harga sesuai aturan.
- [x] Status booking berubah benar.
- [x] Payment status berubah benar.

### Anti Double Booking Architecture

| Layer     | File                                      | Responsibility                        |
| --------- | ----------------------------------------- | ------------------------------------- |
| Validator | `src/lib/validators/booking-validator.ts` | Zod schema + `validateBookingInput()` |
| Service   | `src/lib/services/booking-service.ts`     | Re-check + create + audit log         |
| API       | `src/app/api/bookings/route.ts`           | HTTP 409 on conflict                  |
| UI        | `src/app/(public)/booking/form/page.tsx`  | Conflict error + "Pilih Jam Lain"     |
| Types     | `src/lib/types/domain.ts`                 | `AuditLogEntry` type                  |
| Adapter   | All adapter files                         | `logAudit()` + `getAuditLogs()`       |

**Active blocking statuses:** `pending`, `waiting_payment`, `paid`, `confirmed`

**Overlap check:** Same `courtId` + `bookingDate` + overlapping `startTime`/`endTime`

## Payment Manual (Stage 6)

- [x] Success page menampilkan pilihan metode pembayaran setelah booking.
- [x] 6 metode pembayaran tersedia (BCA, BNI, GoPay, OVO, Dana, QRIS).
- [x] Instruksi pembayaran tampil lengkap (rekening/nomor, langkah, nominal).
- [x] User bisa upload bukti pembayaran (image/file).
- [x] Status booking berubah ke `waiting_payment` setelah upload bukti.
- [x] Bukti pembayaran tersimpan (paymentProofUrl ter-update).
- [x] User melihat "Menunggu Konfirmasi" setelah upload bukti.
- [x] Admin melihat link bukti pembayaran di halaman kelola booking.
- [x] Admin bisa klik "Konfirmasi Bayar" → booking jadi `confirmed`, payment jadi `paid`.
- [x] Admin bisa klik "Tolak Bayar" → booking kembali `waiting_payment`, bukti dihapus.
- [x] PaymentMethod.gateway field tersedia untuk integrasi ipaymu masa depan.
- [x] Build berhasil tanpa error (31 routes ter-generate).

### Payment Manual Architecture

| Layer       | File                                        | Responsibility                        |
| ----------- | ------------------------------------------- | ------------------------------------- |
| Types       | `src/lib/types/domain.ts`                   | `PaymentMethod`, `PaymentInstruction` |
| Service     | `src/lib/services/payment-service.ts`       | Payment flow logic                    |
| Adapter     | `src/lib/adapters/mock-adapter.ts`          | 6 mock payment methods                |
| Adapter     | `src/lib/adapters/google-sheets-adapter.ts` | Read payment_methods sheet            |
| API (user)  | `src/app/api/payments/methods/route.ts`     | GET payment methods                   |
| API (user)  | `src/app/api/payments/proof/route.ts`       | POST upload proof                     |
| API (user)  | `src/app/api/bookings/[id]/route.ts`        | GET booking detail                    |
| API (admin) | `src/app/api/admin/payments/[id]/route.ts`  | POST confirm/reject payment           |
| UI (user)   | `src/app/(public)/booking/success/page.tsx` | 3-step payment flow                   |
| UI (admin)  | `src/app/admin/bookings/page.tsx`           | Confirm/reject buttons + proof link   |

**Payment flow:** `pending` → `waiting_payment` (upload proof) → `confirmed` + `paid` (admin confirms)

## Notification (Stage 7)

- [x] Notifikasi terkirim saat booking dibuat (customer + admin alert).
- [x] Notifikasi terkirim saat booking dikonfirmasi admin.
- [x] Notifikasi terkirim saat booking ditolak admin.
- [x] Notifikasi terkirim saat booking dibatalkan.
- [x] WhatsApp redirect link berfungsi (wa.me link).
- [x] Email template ter-generate dengan data booking lengkap.
- [x] Push notification payload ter-format benar.
- [x] Notification log tersimpan di adapter (mock/google sheets/postgres).
- [x] Admin bisa melihat log notifikasi di `/admin/notifications`.
- [x] Admin bisa filter notifikasi berdasarkan channel dan status.
- [x] Statistik notifikasi tampil (total, sent, failed).
- [x] Notification non-blocking — booking flow tidak terganggu jika notifikasi gagal.
- [x] `GET /api/admin/notifications` berfungsi dengan pagination dan filters.

### Notification Architecture

| Layer       | File                                        | Responsibility                           |
| ----------- | ------------------------------------------- | ---------------------------------------- |
| Types       | `src/lib/types/domain.ts`                   | `NotificationLog`, channel, type, status |
| Service     | `src/lib/services/notification-service.ts`  | Send to all channels                     |
| Templates   | `src/lib/notification-templates.ts`         | Email, WhatsApp, Push message templates  |
| Adapter     | `src/lib/adapters/database-adapter.ts`      | Notification CRUD interface              |
| Adapter     | `src/lib/adapters/mock-adapter.ts`          | In-memory notification storage           |
| Adapter     | `src/lib/adapters/google-sheets-adapter.ts` | notification_logs sheet                  |
| Adapter     | `src/lib/adapters/postgres-adapter.ts`      | notification_logs table                  |
| API (admin) | `src/app/api/admin/notifications/route.ts`  | GET list notifications                   |
| UI (admin)  | `src/app/admin/notifications/page.tsx`      | Notification log list + filters          |
| Integration | `src/lib/services/booking-service.ts`       | Trigger notifications on booking events  |

**Notification types:** `booking_created`, `booking_confirmed`, `booking_rejected`, `booking_cancelled`, `payment_confirmed`, `payment_rejected`, `admin_alert`, `reminder`

**Channels:** `email` (SMTP stub), `whatsapp` (wa.me redirect), `push` (Service Worker), `in_app` (future)

**Status flow:** `pending` → `sent` | `failed` | `skipped`

## Admin Authentication (Stage 9)

- [x] Admin harus login sebelum akses dashboard (`/admin/*`).
- [x] Admin login page tampil dengan tema sporty (dark gradient).
- [x] Login form: email + password input.
- [x] Login berhasil → redirect ke `/admin` dashboard.
- [x] Login gagal → pesan error "Email atau password salah".
- [x] Session tersimpan di cookie httpOnly (`lapangin_session`).
- [x] Admin bisa logout dari sidebar.
- [x] Logout → redirect ke `/admin/login`.
- [x] Direct akses `/admin` tanpa session → redirect ke `/admin/login`.
- [x] Default admin: `admin@arenabook.com` / `admin123`.
- [x] `GET /api/auth/session` returns user info when logged in.
- [x] `GET /api/auth/session` returns 401 when not logged in.

### Admin Auth Architecture

| Layer   | File                                     | Responsibility                         |
| ------- | ---------------------------------------- | -------------------------------------- |
| JWT     | `src/lib/auth/jwt.ts`                    | sign/verify JWT, hash/compare password |
| Context | `src/lib/auth/context.tsx`               | AuthProvider, useAuth() hook           |
| API     | `src/app/api/auth/admin/login/route.ts`  | Validate admin, set cookie             |
| API     | `src/app/api/auth/admin/logout/route.ts` | Clear cookie                           |
| API     | `src/app/api/auth/session/route.ts`      | Return current user from cookie        |
| UI      | `src/app/admin/login/page.tsx`           | Admin login form                       |
| Layout  | `src/components/admin/AdminLayout.tsx`   | Session check + redirect               |

**Cookie:** `lapangin_session` — httpOnly, sameSite=lax, maxAge=86400, path=/

## Customer Registration, Login & Loyalty Points (Stage 10)

### Customer Auth

- [x] Register page tampil (`/register`) dengan form: name, email, phone, password.
- [x] Register berhasil → redirect ke `/login`.
- [x] Register gagal (email duplikat) → pesan error.
- [x] Login page tampil (`/login`) dengan form: email + password.
- [x] Login berhasil → redirect ke homepage, navbar shows user menu.
- [x] Login gagal → pesan error.
- [x] `POST /api/auth/customer/register` creates customer with hashed password.
- [x] `POST /api/auth/customer/login` validates and sets JWT cookie.
- [x] `POST /api/auth/customer/logout` clears session.
- [x] Navbar shows "Masuk" / "Daftar" buttons when logged out.
- [x] Navbar shows user dropdown (name, profile link, logout) when logged in.

### Customer Profile & Loyalty

- [x] Profile page (`/profile`) shows customer info (name, email, phone).
- [x] Profile shows loyalty points balance (animated counter).
- [x] Profile shows loyalty tier badge (Bronze/Silver/Gold/Platinum with colors).
- [x] Profile shows booking stats (total bookings, total spent).
- [x] Profile shows redemption history.
- [x] Profile shows available rewards with "Tukar" button.
- [x] `GET /api/customer/loyalty` returns balance, tier, history, rewards.
- [x] `POST /api/customer/loyalty` redeems a reward (deducts points).

### Loyalty Points Integration

- [x] Points earned when booking confirmed by admin (10 pts per Rp10,000).
- [x] Points added to customer's loyalty balance.
- [x] Tier auto-updates based on total points:
  - Bronze: < 500 pts
  - Silver: 500–1,999 pts
  - Gold: 2,000–4,999 pts
  - Platinum: ≥ 5,000 pts
- [x] Redemption deducts points from balance.
- [x] Redemption history recorded.

### Loyalty Rewards Available

| Reward               | Points Required | Reward Type  | Reward Value |
| -------------------- | --------------- | ------------ | ------------ |
| Diskon Rp10.000      | 500             | discount     | Rp10.000     |
| Diskon Rp25.000      | 1.000           | discount     | Rp25.000     |
| Gratis Main 1 Jam    | 2.000           | free_hour    | 1 jam        |
| Gratis Main 2 Jam    | 3.500           | free_hour    | 2 jam        |
| Gratis Sewa Lapangan | 5.000           | free_booking | 1 booking    |

### Auth & Loyalty Architecture

| Layer   | File                                              | Responsibility                                         |
| ------- | ------------------------------------------------- | ------------------------------------------------------ |
| JWT     | `src/lib/auth/jwt.ts`                             | SHA-256 hashing, JWT sign/verify                       |
| Context | `src/lib/auth/context.tsx`                        | Admin + customer session management                    |
| Types   | `src/lib/types/domain.ts`                         | Customer, LoyaltyReward, LoyaltyRedemption             |
| Adapter | `src/lib/adapters/mock-adapter.ts`                | Customer CRUD, loyalty CRUD                            |
| Adapter | `src/lib/adapters/google-sheets-adapter.ts`       | customers, loyalty_rewards, loyalty_redemptions sheets |
| API     | `src/app/api/auth/customer/register/route.ts`     | Create customer account                                |
| API     | `src/app/api/auth/customer/login/route.ts`        | Authenticate customer                                  |
| API     | `src/app/api/auth/customer/logout/route.ts`       | Clear session                                          |
| API     | `src/app/api/customer/loyalty/route.ts`           | GET balance+history, POST redeem                       |
| UI      | `src/app/(auth)/register/page.tsx`                | Registration form                                      |
| UI      | `src/app/(auth)/login/page.tsx`                   | Login form                                             |
| UI      | `src/app/(auth)/profile/page.tsx`                 | Profile + loyalty dashboard                            |
| UI      | `src/components/ui/Navbar.tsx`                    | Auth-aware navigation                                  |
| Booking | `src/app/api/admin/bookings/[id]/status/route.ts` | Points earned on confirm                               |

## Build & Compilation

- [x] `npm run build` berhasil tanpa error TypeScript.
- [x] Semua pages/routes ter-generate (termasuk auth, loyalty, notification, offline).
- [x] Admin pages ter-generate sebagai static pages.
- [x] Admin API routes ter-generate sebagai dynamic server functions.
- [x] Auth routes (`/login`, `/register`, `/profile`) ter-generate.
- [x] Auth API routes (`/api/auth/*`, `/api/customer/loyalty`) ter-generate.
- [x] `/admin/notifications` page ter-generate.
- [x] `/api/admin/notifications` API route ter-generate.
- [x] `/offline` page ter-generate sebagai static page.

## Full E2E Flow Test

- [x] Register customer → Login → Browse sports → Select venue → Select court → Pick date → Pick slot → Fill form → Submit booking → Booking success → Choose payment → Upload proof → Admin login → Confirm booking → Customer earns points → Check profile → Redeem reward.

## PWA (Stage 8)

- [x] Manifest terbaca (`/manifest.json` — display: standalone, start_url, icons, shortcuts).
- [x] Icon tampil (`public/icons/icon-192.png`, `icon-512.png`).
- [x] PWA meta tags di layout (apple-web-app, theme-color, apple-touch-icon, viewport).
- [x] Service Worker register otomatis (`ServiceWorkerRegistration.tsx`).
- [x] Service Worker caching berfungsi (cache-first images, stale-while-revalidate static, network-first HTML).
- [x] Install prompt muncul di browser yang support (`InstallPrompt.tsx`).
- [x] Offline fallback page tampil (`/offline` — React component + `public/offline.html`).
- [x] Push notification listener aktif di service worker.
- [x] Build berhasil tanpa error (34 routes ter-generate).

### PWA Architecture

| Layer     | File                                               | Responsibility                                 |
| --------- | -------------------------------------------------- | ---------------------------------------------- |
| Manifest  | `public/manifest.json`                             | PWA metadata, icons, display, shortcuts        |
| SW        | `public/sw.js`                                     | Caching strategies, push listener, offline     |
| SW (HTML) | `public/offline.html`                              | Static offline fallback                        |
| Component | `src/components/pwa/ServiceWorkerRegistration.tsx` | Auto-register service worker                   |
| Component | `src/components/pwa/InstallPrompt.tsx`             | beforeinstallprompt detection + install banner |
| Page      | `src/app/offline/page.tsx`                         | React offline fallback page                    |
| Layout    | `src/app/layout.tsx`                               | PWA meta tags, apple-web-app, viewport         |
| Icons     | `public/icons/icon-192.png`, `icon-512.png`        | PWA icons for install & splash                 |

### Service Worker Caching Strategy

| Request Type                 | Strategy                         | Cache Name         |
| ---------------------------- | -------------------------------- | ------------------ |
| Static assets (JS/CSS/fonts) | stale-while-revalidate           | lapangin-static-v1 |
| Images                       | cache-first                      | lapangin-images-v1 |
| API calls                    | network-first                    | lapangin-api-v1    |
| HTML navigation              | network-first + offline fallback | lapangin-pages-v1  |
| Push notifications           | push event listener              | N/A (event-based)  |

**Pre-cached:** `/offline.html`, `/icons/icon-192.png`, `/icons/icon-512.png`

## UI/UX Optimization (Sports Theme)

### Customer-Facing Pages

- [x] Homepage uses gradient hero section with sporty green/emerald theme.
- [x] Sport cards have hover effects and smooth transitions.
- [x] Navbar has blur backdrop and gradient logo on scroll.
- [x] Booking flow has step indicator with active/completed states.
- [x] Slot selector has color-coded availability (green=available, red=booked, gray=past).
- [x] Booking form has floating labels and animated focus states.
- [x] Success page has animated checkmark and confetti-style celebration.
- [x] Profile page has animated stats cards with gradient borders.
- [x] Loyalty tier badges use gradient colors (Bronze→Platinum).
- [x] All pages are mobile-first responsive (360px to 1440px+).
- [x] Cards, buttons, and inputs have consistent rounded corners and shadows.

### Admin Pages

- [x] Admin login page has dark gradient sporty theme.
- [x] Admin dashboard has stat cards with gradient backgrounds.
- [x] Admin sidebar has active state with gradient highlight.
- [x] Admin tables are responsive with horizontal scroll on mobile.
- [x] Admin mobile has bottom navigation bar.
- [x] Status badges use consistent color coding (amber=pending, green=confirmed, red=rejected).
- [x] Admin layout has sticky header with blur backdrop.
- [x] Empty states display friendly messages with icons.
- [x] Loading states use skeleton animations.

### Responsive Breakpoints

| Breakpoint | Layout                            |
| ---------- | --------------------------------- |
| < 640px    | Mobile: single column, bottom nav |
| 640–1024px | Tablet: 2-column grids            |
| > 1024px   | Desktop: sidebar + content        |

## Deployment

- [ ] Build berhasil.
- [ ] Environment variables lengkap.
- [ ] API route berjalan di Vercel.
- [ ] Booking masuk ke Spreadsheet.
- [x] Mobile layout aman.
