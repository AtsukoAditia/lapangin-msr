## Summary

<!-- Explain what changed and why. -->

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs
- [ ] Infra / CI
- [ ] Database / adapter

## Stage 12 safety checklist

- [ ] I read `docs/SYSTEM_TRUTH.md` when touching auth, booking, payment, database, or privacy-sensitive code.
- [ ] I did not expose booking/customer private data through public endpoints.
- [ ] I did not bypass the service layer or database adapter pattern.
- [ ] I did not weaken JWT/auth/session handling.
- [ ] I kept `DATABASE_PROVIDER=mock` for normal feature work.
- [ ] I did not enable `postgres` unless this PR implements PostgreSQL support.
- [ ] I did not run broad dependency upgrades inside this feature PR.

## Local checks

- [ ] `npm run doctor`
- [ ] `npm run type-check`
- [ ] `npm run lint`
- [ ] `npm run build`

## Notes / screenshots

<!-- Add screenshots or notes for UI changes. -->
