# Stage 12 — Hardening & Production Readiness

Stage 12 focuses on making Lapangin safer and more stable before wider feature expansion or real business usage.

## Goals

1. Auth security
2. Data privacy
3. Dependency pinning
4. PostgreSQL migration readiness
5. Documentation consistency
6. Production-grade double-booking prevention

## Completed in this stage branch

- Middleware now verifies JWT session and role before allowing admin/customer routes.
- Auth routes now use shared token-name constants instead of repeated string literals.
- Password utility foundation uses bcryptjs for future database-backed accounts.
- Public `GET /api/bookings` no longer exposes all booking data.
- PostgreSQL schema draft includes a booking no-overlap exclusion constraint.
- System truth document added to align credentials, env, routes, and limitations.

## Production hardening checklist

### Auth security

- [x] Verify token and role in middleware.
- [x] Use HTTP-only cookies.
- [x] Centralize token cookie names.
- [x] Add bcryptjs password utility.
- [ ] Remove all demo credential fallback before production.
- [ ] Require strong `JWT_SECRET` in all production environments.
- [ ] Add login/register rate limiting.
- [ ] Move standalone in-memory auth to database-backed auth.

### Data privacy

- [x] Disable public listing of all bookings.
- [ ] Add customer booking lookup with booking code + phone verification.
- [ ] Add admin-only pagination/filtering for booking list.
- [ ] Redact phone/email in logs and UI where not needed.

### Dependency pinning

- [ ] Replace all `latest` dependency ranges with explicit versions.
- [ ] Keep `package-lock.json` synchronized using `npm install --package-lock-only`.
- [ ] Keep Dependabot enabled for controlled updates.

### PostgreSQL migration

- [x] Add initial SQL schema draft.
- [ ] Implement `PostgresAdapter` with real queries.
- [ ] Add migrations runner.
- [ ] Add seed script for sports/venues/courts/payment methods.
- [ ] Configure production `DATABASE_PROVIDER=postgres` only after adapter is complete.

### Anti double-booking

- [x] Keep service-layer conflict check.
- [x] Add PostgreSQL exclusion constraint draft for overlapping booking ranges.
- [ ] Wrap booking creation in a transaction.
- [ ] Add concurrency tests for same court/date/time.

## Recommended next PRs

1. `feat/stage-12-auth-db` — move auth service to adapter/database and remove demo fallbacks.
2. `feat/stage-12-postgres-adapter` — implement PostgreSQL adapter with migrations.
3. `feat/stage-12-tests` — add unit/API/E2E tests and concurrency test.
4. `feat/stage-12-deps` — pin versions and regenerate lockfile.
