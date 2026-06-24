# CLINE Local Workflow — Lapangin

Use this guide before asking CLINE to continue features locally.

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

## 3. Run local readiness check

```bash
npm run doctor
```

The doctor script checks:

- required project files
- `DATABASE_PROVIDER`
- `JWT_SECRET`
- provider-specific environment variables
- warning for dependencies still using `latest`

## 4. Start local dev

```bash
npm run dev
```

Open:

- Public app: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## 5. Before every CLINE feature task

Create a feature branch:

```bash
git checkout -b feat/<short-feature-name>
```

Ask CLINE to follow this pattern:

1. Read `docs/SYSTEM_TRUTH.md` first.
2. Read impacted source files before editing.
3. Make the smallest useful change.
4. Keep service logic in `src/lib/services`.
5. Keep data access in `src/lib/adapters`.
6. Keep domain types in `src/lib/types`.
7. Keep validation in `src/lib/validators`.
8. Do not expose private booking/customer data in public APIs.
9. Do not set `DATABASE_PROVIDER=postgres` unless implementing PostgreSQL support.
10. Run checks before finishing.

## 6. Required checks before commit

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

## 7. CLINE prompt template

Use this when starting a new local task:

```txt
You are working on Lapangin MSR.
Read docs/SYSTEM_TRUTH.md and docs/CLINE_LOCAL_WORKFLOW.md first.
Keep DATABASE_PROVIDER=mock for local feature work.
Do not expose booking/customer private data in public APIs.
Do not bypass service layer or adapter pattern.
Before editing, inspect related files.
After editing, run npm run doctor, npm run type-check, npm run lint, and npm run build.
Task: <describe feature here>
```

## 8. Areas that need extra caution

### Auth

Do not add JWT fallback secrets. `JWT_SECRET` must come from env.

### Booking

Never create booking directly from UI or adapter without service-layer conflict checks.

### PostgreSQL

Schema exists, but adapter implementation is still a separate follow-up. Keep mock mode for normal feature work.

### Dependencies

Do not run broad dependency upgrades inside feature PRs. Dependency pinning/upgrades should be isolated in a dedicated PR.
