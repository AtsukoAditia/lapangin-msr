# Marketplace Gap Sync Plan — Lapangin

Dokumen ini adalah checklist kerja sebelum Lapangin lanjut ke fitur advanced seperti referral, team invite, public roster, open play, sparring, turnamen, dan full marketplace onboarding.

## Goal

Menyinkronkan gap antara dokumentasi, CLINE workflow, dan implementasi kode agar project aman dilanjutkan secara lokal.

Arah produk:

> Booking-first marketplace + venue operations platform untuk Indonesia.

Artinya Lapangin harus unggul dulu di booking flow, payment status, owner/operator tooling, privacy, dan loyalty ledger sebelum mengejar fitur komunitas besar.

---

## Priority 0 — Source of truth sync

### Done in this sync

- README diarahkan ke konsep booking-first marketplace.
- Credential demo diseragamkan:
  - `admin@lapangin.id / Admin123!@#`
  - `owner@lapangin.id / Owner123!@#`
- `docs/SYSTEM_TRUTH.md` diperbarui sebagai source of truth.
- `docs/CLINE_LOCAL_WORKFLOW.md` diperketat untuk kerja lokal.
- `.clinerules` ditambahkan untuk membatasi perubahan CLINE.
- Payment proof route mulai support lookup via `bookingCode`.
- Demo in-memory auth memakai password hashing.

### Still needs local verification

Run:

```bash
npm ci
npm run doctor
npm run type-check
npm run lint
npm run build
```

---

## Priority 1 — Booking and payment hardening

### Current state

- Booking dibuat sebagai temporary hold.
- Status awal:
  - `bookingStatus = waiting_payment`
  - `paymentStatus = unpaid`
- Booking punya `expiresAt`.
- Availability mengabaikan temporary hold yang expired.
- Payment proof dapat dikirim manual.

### Gap

- Success/status page masih perlu dibuat lebih aman agar submit payment proof memakai `bookingCode + phone` secara konsisten.
- Current proof upload masih base64; cukup untuk MVP lokal, belum cocok untuk production.
- `bookingId` masih tersedia sebagai compatibility path.

### Next tasks for CLINE

1. Tambahkan input verifikasi phone/email pada halaman `/booking/success?code=...` sebelum submit proof.
2. Ubah submit proof UI agar mengirim:

```json
{
  "bookingCode": "BK-XXXXXX-ABCD",
  "phone": "08123456789",
  "proofUrl": "..."
}
```

3. Setelah UI selesai, hapus compatibility payload `bookingId` dari `POST /api/payments/proof`.
4. Tambahkan validasi route dengan Zod.
5. Buat abstraction storage:
   - MVP: base64/string
   - Production: object storage key/URL
6. Tambahkan test manual:
   - booking waiting_payment bisa submit proof
   - phone salah ditolak
   - booking expired ditolak
   - booking confirmed/rejected tidak bisa submit proof ulang

---

## Priority 2 — Auth cleanup

### Current state

- JWT secret wajib dari env.
- Admin/customer demo in-memory auth masih ada.
- Password demo/customer sudah di-hash.

### Gap

- Production auth belum database-backed.
- Belum ada email/phone verification.
- Belum ada forgot password/reset password.

### Next tasks for CLINE

1. Pastikan semua route auth memakai service layer.
2. Jangan simpan plaintext password di source atau mock store.
3. Tambahkan password policy kecil:
   - min 8 karakter
   - kombinasikan huruf/angka untuk production later
4. Tambahkan email/phone uniqueness check lintas adapter.
5. Rancang tabel production auth di PostgreSQL sebelum real launch.

---

## Priority 3 — Loyalty ledger cleanup

### Current state

- Booking confirmation memberi point:

```txt
1 point per Rp 10.000 confirmed booking value
```

- Reward mock sudah ada.
- Loyalty transaction interface sudah ada di adapter.

### Gap

- Awarding masih berada di `BookingService.confirmBooking()`.
- Belum ada guard kuat terhadap duplicate award.
- Belum ada campaign/referral rules.

### Next tasks for CLINE

1. Buat `src/lib/services/loyalty-service.ts`.
2. Pindahkan semua logic award/redeem ke service itu.
3. Tambahkan idempotency check by `bookingId` + transaction type.
4. Pastikan booking yang sama tidak bisa menghasilkan point dua kali.
5. Buat event names:
   - `booking_confirmed`
   - `booking_completed`
   - `referral_registered`
   - `referral_first_booking_confirmed`
   - `team_member_joined`
6. Baru setelah ledger stabil, implement referral/team invite.

---

## Priority 4 — Owner/operator access control

### Current state

- Marketplace direction sudah ada.
- Venue punya `ownerId` dan `approvalStatus`.
- Adapter punya method owner-scoped seperti `getVenuesByOwner()` dan `getBookingsByOwner()`.

### Gap

- Authorization owner-scoped belum harus konsisten di semua admin route.
- Role `admin` saat ini juga dipakai untuk owner demo.

### Next tasks for CLINE

1. Audit semua route `/api/admin/*`.
2. Tentukan role matrix:
   - `super_admin`: semua venue/platform
   - `admin`: owner/venue admin scoped
   - `staff`: operator scoped
3. Pastikan owner hanya bisa melihat booking/venue/court miliknya.
4. Tambahkan helper authorization, misalnya:

```ts
assertCanAccessVenue(session, venueId)
assertCanAccessBooking(session, bookingId)
```

5. Jangan hardcode `role === "admin"` untuk semua admin access.

---

## Priority 5 — Privacy-safe public booking visibility

### User idea

User ingin jadwal booking pada jam tertentu dapat dilihat publik, termasuk detail siapa saja yang booking/main.

### Product-safe interpretation

Public schedule boleh ada, tapi jangan expose data pribadi by default.

### Recommended public fields

- Venue name
- Court name
- Sport
- Date
- Start/end time
- Booking/session status
- Host alias or team name, only if opt-in
- Player count
- Open slots count
- Level: casual/intermediate/competitive
- CTA: join/request invite

### Do not expose publicly

- Full customer name by default
- Phone
- Email
- Address
- Internal booking ID
- Payment proof
- Payment status detail beyond safe labels

### Next tasks for CLINE

1. Add `publicVisibility` field to session/booking extension model.
2. Add `hostAlias` or `teamName`.
3. Add opt-in consent checkbox.
4. Build read-only public schedule endpoint.
5. Build public session roster endpoint that returns only safe fields.

---

## Priority 6 — Referral and team invite

### MVP concept

One host books a court, invites friends/team members, and each invited user can register/join the booking.

### Required models

- `team_invites`
- `booking_participants`
- `referral_codes`
- `referral_events`
- `loyalty_transactions`

### Safe reward rules

- Referral registration alone should not give large points.
- Bigger bonus only after invited user verifies phone/email and completes/confirmed booking.
- Block self-referral by phone/email/device/session heuristics where possible.
- Campaign rules should be configurable.

### Suggested first rules

| Event | Reward |
| --- | ---: |
| Invited user registers | 10 points |
| Invited user joins roster | 10 points |
| Invited user first confirmed booking | 50 points |
| Host completes group booking with 4+ registered players | 25 points |

Values are examples. Final policy must be configurable before production.

---

## Priority 7 — Payments for Indonesia

### MVP

- Manual transfer/e-wallet/QRIS instruction.
- Upload payment proof.
- Admin verification.

### Production direction

- Add payment provider abstraction.
- Support hosted checkout first.
- Add webhook handling.
- Add settlement/reconciliation report for owner.

Suggested provider abstraction:

```ts
interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentIntent>;
  verifyWebhook(request: Request): Promise<PaymentWebhookEvent>;
  getPaymentStatus(providerReference: string): Promise<PaymentStatus>;
}
```

Keep manual payment proof as fallback for small venues.

---

## Priority 8 — Dependency and production readiness

### Current gap

Some dependencies still use `latest` in `package.json` and lockfile root.

### Next tasks for CLINE

1. Do not combine dependency pinning with feature work.
2. Create a dedicated chore branch.
3. Pin versions based on current lockfile.
4. Run full checks.
5. Commit lockfile changes together with `package.json`.

---

## Suggested local task order

Use this order when continuing with CLINE:

1. `fix/payment-proof-ui-phone-verification`
2. `refactor/loyalty-service-idempotency`
3. `fix/admin-owner-scoped-access`
4. `feat/public-schedule-safe-fields`
5. `feat/team-invite-roster-mvp`
6. `feat/referral-ledger-mvp`
7. `chore/dependency-pinning`
8. `feat/postgres-adapter-phase-1`

---

## CLINE copy-paste prompt for next session

```txt
You are continuing Lapangin MSR locally.
First read docs/SYSTEM_TRUTH.md, docs/CLINE_LOCAL_WORKFLOW.md, docs/14-marketplace-gap-sync-plan.md, and .clinerules.
Keep DATABASE_PROVIDER=mock.
Do not add advanced marketplace/community features until the current gap for the target area is closed.
Use service layer, adapter pattern, domain types, and privacy-safe public APIs.
Run npm run doctor, npm run type-check, npm run lint, and npm run build before finishing.

Task: <paste one priority task here>
```
