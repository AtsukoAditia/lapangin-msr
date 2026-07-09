# CLINE Local Workflow — Lapangin

Use this guide before asking CLINE to continue features locally.

## 0. Source of truth order

When docs or code disagree, follow this order:

1. `docs/SYSTEM_TRUTH.md`
2. `docs/14-marketplace-gap-sync-plan.md`
3. Current source code in `src/`
4. Older stage docs in `docs/`
5. README summary

Do not implement new advanced marketplace/community features before the current gap-sync checklist is handled.

## 1. Pull latest main

```bash
git checkout main
git pull origin main
npm ci
```

## 2. Prepare local env

```bash
cp .env.example .env.local
```

Set at least:

```env
DATABASE_PROVIDER=mock
JWT_SECRET=replace-with-a-long-random-value-at-least-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Lapangin
```

Generate a better local secret with:

```bash
openssl rand -base64 48
```

Keep `DATABASE_PROVIDER=mock` while building normal app features. Use `postgres` only when the Postgres adapter/migrations are being implemented.

## 3. Canonical demo accounts

| Email             | Password    | Role        |
| ----------------- | ----------- | ----------- |
| admin@lapangin.id | Admin123!@# | Super Admin |
| owner@lapangin.id | Owner123!@# | Venue Owner |

Do not reintroduce old credentials such as `admin@lapangin.com / admin123`.

## 4. Run local readiness check

```bash
npm run doctor
```

The doctor script checks:

- required project files
- `DATABASE_PROVIDER`
- `JWT_SECRET`
- provider-specific environment variables
- warning for dependencies still using `latest`

## 5. Start local dev

```bash
npm run dev
```

Open:

- Public app: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## 6. Before every CLINE feature task

Create a feature branch:

```bash
git checkout -b feat/<short-feature-name>
```

Ask CLINE to follow this pattern:

1. Read `docs/SYSTEM_TRUTH.md` first.
2. Read `docs/14-marketplace-gap-sync-plan.md` if the task touches booking, auth, loyalty, marketplace, referral, owner, or payment.
3. Read impacted source files before editing.
4. Make the smallest useful change.
5. Keep service logic in `src/lib/services`.
6. Keep data access in `src/lib/adapters`.
7. Keep domain types in `src/lib/types`.
8. Keep validation in `src/lib/validators` or route-local schemas.
9. Do not expose private booking/customer data in public APIs.
10. Do not set `DATABASE_PROVIDER=postgres` unless implementing PostgreSQL support.
11. Do not add advanced features before closing the gap they depend on.
12. Run checks before finishing.

## 7. Required checks before commit

```bash
npm run doctor
npm run type-check
npm run lint
npm run build
```

Or all at once:

```bash
npm run check
```

## 8. CLINE prompt template

Use this when starting a new local task:

```txt
You are working on Lapangin MSR.
Read docs/SYSTEM_TRUTH.md, docs/CLINE_LOCAL_WORKFLOW.md, and docs/14-marketplace-gap-sync-plan.md first.
Keep DATABASE_PROVIDER=mock for local feature work unless the task is explicitly about PostgreSQL.
Use canonical demo accounts only: admin@lapangin.id / Admin123!@# and owner@lapangin.id / Owner123!@#.
Do not expose booking/customer private data in public APIs.
Do not bypass service layer or adapter pattern.
Before editing, inspect related files.
Prefer small, testable commits.
After editing, run npm run doctor, npm run type-check, npm run lint, and npm run build.
Task: <describe feature here>
```

## 9. Areas that need extra caution

### Auth

- Do not add JWT fallback secrets. `JWT_SECRET` must come from env.
- Do not store plaintext passwords.
- Demo in-memory auth may exist for local work, but password handling must still use hashing.
- Production auth must become database-backed.

### Booking

- Never create booking directly from UI or adapter without service-layer conflict checks.
- New bookings start as temporary holds.
- Booking success/status page is not final confirmation.
- Final booking validity requires admin/owner confirmation.

### Payment proof

- Prefer `bookingCode + phone + proofUrl` for public payment proof submission.
- `bookingId` support is temporary compatibility only.
- Do not expose internal booking IDs as the primary public lookup mechanism.
- Base64 upload is MVP only; production should use object storage.

### Public booking visibility

- Public schedule may show court/date/time/status and opt-in aliases/team names.
- Do not expose full name, phone, email, or address publicly.
- Public roster/open-play must be opt-in.

### Loyalty and referral

- Points are awarded only after booking confirmation.
- Avoid duplicate point awards for the same booking.
- Referral rewards should require verified registration and completed/confirmed activity.

### PostgreSQL

- Schema exists, but adapter implementation is still a separate follow-up.
- Keep mock mode for normal feature work.
- Do not assume PostgreSQL is production-ready until adapter, migrations, and tests exist.

### Dependencies

- Do not run broad dependency upgrades inside feature PRs.
- Dependency pinning/upgrades should be isolated in a dedicated PR.
