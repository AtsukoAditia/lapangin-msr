# 🏟️ Lapangin — Sports Court Booking Marketplace

> Web-based PWA untuk booking lapangan olahraga, loyalty points, dan operasional venue olahraga di Indonesia.

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps)

---

## 🎯 Product Direction

Lapangin diarahkan sebagai **booking-first marketplace** untuk sewa lapangan olahraga di Indonesia.

Fokus tahap awal:

1. User bisa mencari venue, memilih slot, booking, bayar, dan cek status dengan cepat.
2. User punya akun, history booking, loyalty points, dan nantinya referral/team invite.
3. Owner/operator venue bisa mengelola lapangan, harga, jadwal, booking, pembayaran, dan laporan.
4. Marketplace bisa menampung banyak owner/venue, tetapi publikasi venue tetap dikontrol platform admin.

Fitur komunitas seperti public session, roster tim, open play, sparring, dan turnamen adalah roadmap lanjutan setelah booking, payment, auth, dan owner operations stabil.

---

## ✨ Fitur Utama Saat Ini

### 🏠 Halaman Publik

- **Homepage** — Hero section, kategori olahraga, venue populer
- **Pemesanan** — 5 langkah: Pilih Area/Olahraga → Pilih Venue → Pilih Lapangan → Isi Data → Pembayaran/Status
- **Area Filtering** — Area/lokasi dapat diteruskan dari halaman booking ke listing venue
- **Cek Booking** — Lihat status booking dengan kode booking
- **Responsive** — Mobile-first design, PWA ready

### 👤 Pelanggan (Customer)

- **Registrasi** — Daftar akun dengan nama, email, telepon, password
- **Login** — Akses profil dan riwayat booking
- **Loyalty Points** — Dapat poin setiap transaksi yang dikonfirmasi admin/owner
- **Profil** — Lihat tier, poin, dan riwayat transaksi

### ⚙️ Admin / Owner Panel

- **Login Terproteksi** — Admin/owner/staff memakai JWT authentication
- **Dashboard** — Statistik booking, revenue, pelanggan
- **Kelola Booking** — Konfirmasi, tolak, lihat detail booking
- **Kelola Lapangan** — CRUD lapangan
- **Kelola Harga** — Atur pricing per lapangan
- **Notifikasi** — Riwayat notifikasi/log MVP

---

## 🛠️ Tech Stack

| Technology            | Purpose                                 |
| --------------------- | --------------------------------------- |
| **Next.js App Router** | App routing & server rendering          |
| **TypeScript**        | Type safety                             |
| **Tailwind CSS**      | Styling                                 |
| **JWT (HMAC-SHA256)** | Authentication                          |
| **bcryptjs**          | Password hashing                        |
| **Mock Adapter**      | Local/demo DB                           |
| **Google Sheets**     | Demo online database option             |
| **PostgreSQL**        | Production migration target             |

---

## 🚀 Safe Local Quick Start

```bash
# 1. Install exact dependencies from lockfile
npm ci

# 2. Copy environment file
cp .env.example .env.local

# 3. Edit .env.local, keep mock mode for normal local feature work
DATABASE_PROVIDER=mock
JWT_SECRET=replace-with-a-long-random-value-at-least-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lapangin

# 4. Check local readiness
npm run doctor

# 5. Run development server
npm run dev
```

Open:

- Public app: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

Generate a better local `JWT_SECRET` with:

```bash
openssl rand -base64 48
```

For CLINE local work, read these first:

1. [`docs/SYSTEM_TRUTH.md`](docs/SYSTEM_TRUTH.md)
2. [`docs/CLINE_LOCAL_WORKFLOW.md`](docs/CLINE_LOCAL_WORKFLOW.md)
3. [`docs/14-marketplace-gap-sync-plan.md`](docs/14-marketplace-gap-sync-plan.md)

---

## 🔑 Akun Demo Lokal

| Email              | Password     | Role        |
| ------------------ | ------------ | ----------- |
| admin@lapangin.id  | Admin123!@#  | Super Admin |
| owner@lapangin.id  | Owner123!@#  | Venue Owner |

**Login:** http://localhost:3000/admin/login

Customer dapat daftar di: http://localhost:3000/register

> Note: auth masih punya jalur demo/in-memory untuk MVP, tetapi password demo/customer sudah di-hash. Production tetap harus pindah ke database-backed auth.

---

## 🎾 Olahraga yang Didukung

| Sport       | Icon | Venue             |
| ----------- | ---- | ----------------- |
| Futsal      | ⚽   | Arena Futsal Pro  |
| Mini Soccer | 🥅   | Arena Mini Soccer |
| Badminton   | 🏸   | GOR Badminton     |
| Padel       | 🏒   | Padel Arena       |
| Tennis      | 🎾   | Tennis Club       |
| Basketball  | 🏀   | Basketball Center |

---

## 💎 Sistem Loyalty Points

### Canonical MVP Rule

1. User daftar akun customer.
2. User melakukan booking.
3. Booking masuk sebagai `waiting_payment` dan belum final.
4. User submit bukti pembayaran.
5. Admin/owner confirm booking.
6. Poin masuk setelah booking `confirmed`.

Rate saat ini:

```txt
1 point per Rp 10.000 confirmed booking value
```

### Tier System

| Tier        | Poin          | Benefit                |
| ----------- | ------------- | ---------------------- |
| 🥉 Bronze   | 0 - 1.999     | Basic member           |
| 🥈 Silver   | 2.000 - 4.999 | Diskon 5%              |
| 🥇 Gold     | 5.000 - 9.999 | Diskon 10%             |
| 💎 Platinum | 10.000+       | Diskon 15% + prioritas |

### Next Loyalty Roadmap

- Move all point awarding into `LoyaltyService`
- Prevent duplicate point awards per booking
- Add referral/event ledger
- Add reward catalog and redemption flow
- Add team invite bonus after invited user registers and joins/completes a booking

---

## 📁 Struktur Project

```txt
src/
├── app/
│   ├── (auth)/           # Login, Register, Profile
│   ├── (public)/         # Booking flow
│   ├── admin/            # Admin panel protected by middleware
│   └── api/              # API routes
├── lib/
│   ├── auth/             # JWT/session/password utilities
│   ├── adapters/         # Database adapters
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   └── validators/       # Input validation
├── components/           # UI components
└── middleware.ts          # Route protection
```

---

## 📚 Dokumentasi

| Document                                                                  | Description                            |
| ------------------------------------------------------------------------- | -------------------------------------- |
| [Project Overview](docs/01-project-overview.md)                           | Visi & arsitektur                      |
| [Module Roadmap](docs/02-module-roadmap-from-start-to-running.md)         | Tahapan development                    |
| [Testing Checklist](docs/06-testing-checklist.md)                         | Daftar test                            |
| [UI Optimization & Loyalty](docs/08-ui-optimization-and-loyalty-module.md) | Optimasi UI & modul loyalty            |
| [Final System Overview](docs/10-final-system-overview.md)                 | Overview sistem                        |
| [Stage 12 Hardening](docs/12-hardening-production-readiness.md)           | Production-readiness checklist         |
| [System Truth](docs/SYSTEM_TRUTH.md)                                      | Sumber kebenaran status sistem         |
| [CLINE Local Workflow](docs/CLINE_LOCAL_WORKFLOW.md)                      | Panduan aman kerja di VS Code + CLINE  |
| [Marketplace Gap Sync Plan](docs/14-marketplace-gap-sync-plan.md)         | Prioritas gap sync sebelum fitur baru  |

---

## 🧪 Local Checks

```bash
npm run doctor
npm run type-check
npm run lint
npm run build
```

Atau semua sekaligus:

```bash
npm run check
```

### API Testing

```bash
# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","customerPhone":"08123456789","sportId":"futsal","venueId":"venue-arena1","courtId":"court-f1","bookingDate":"2026-06-25","startTime":"10:00","endTime":"12:00","durationMinutes":120}'

# Submit payment proof by booking code
curl -X POST http://localhost:3000/api/payments/proof \
  -H "Content-Type: application/json" \
  -d '{"bookingCode":"BK-XXXXXX-ABCD","phone":"08123456789","proofUrl":"data:image/png;base64,..."}'

# Admin login
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lapangin.id","password":"Admin123!@#"}' \
  -c cookies.txt
```

### Browser Testing

1. Buka http://localhost:3000
2. Pilih area/olahraga → venue → lapangan
3. Pilih tanggal & jam
4. Isi form booking
5. Cek booking code di halaman status/sukses
6. Submit bukti pembayaran
7. Login admin di `/admin/login`
8. Konfirmasi booking → cek status customer/loyalty

---

## 🌐 Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Environment Variables

```env
DATABASE_PROVIDER=mock
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Lapangin
```

For real production booking, use PostgreSQL only after `PostgresAdapter` and migrations are fully implemented.

---

## 📝 License

MIT © 2026 Lapangin
