# CITYRNNG - Claude Project Instructions

See the project source of truth in:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ERD.md`
- `docs/API-CONTRACTS.md`
- `docs/BACKLOG.md`

## Project mission

Build `CITYRNNG`, a city running community platform where users can:

- sign up and log in;
- register for running events;
- check in at events;
- earn points;
- redeem points for partner rewards;
- track their history and progress.

## Architecture rules

- Use a modular monolith, not microservices.
- Use `pnpm + Turborepo` monorepo structure.
- Frontend: `Next.js + TypeScript + Tailwind`.
- Backend: `NestJS + TypeScript`.
- Data layer: `Prisma + PostgreSQL`.
- Cache and jobs: `Redis + BullMQ`.
- Infrastructure: `Docker`, `Docker Compose`, `GitHub Actions`, `Yandex Cloud`.

## Critical domain rules

- Points must be implemented as a ledger using `point_transactions`.
- Never store points only as a mutable field on the user profile.
- All point-awarding and redemption operations must be idempotent.
- Manual point adjustments must be audited.
- Duplicate event registration must be prevented.
- Duplicate check-in for the same event must be prevented.
- Reward redemption must validate available points and limits atomically.

## Workflow rules

- Do not change the agreed stack without explicit approval.
- Work epic by epic from `docs/BACKLOG.md`.
- Before major implementation, propose a short file-level plan.
- Keep changes scoped to the current task.
- Update docs when API, env vars, or workflows change.
- Prefer simple and transparent solutions over clever abstractions.

## Git rules

- Never push directly to `main`.
- Work only in feature branches.
- Use conventional commit messages like `feat:`, `fix:`, `chore:`.
- Do not rewrite history unless explicitly asked.
- Do not edit production servers manually.

## Delivery rules

- Every completed task must leave the repo buildable.
- Add or update `.env.example` when introducing new environment variables.
- Add tests for critical business logic, especially points and rewards.
- Report what was changed, how to run it, and known gaps.

## Deployment rules

- `main` deploys automatically to staging only.
- Production deploy must be manual.
- Database migrations must run as part of deploy.
- Health check must run after deploy.

## Design rules

- Public UI should feel like a city lifestyle community, not a corporate dashboard.
- Runner dashboard should highlight next events, points, and rewards.
- Admin UI can be more utilitarian but must stay clear and fast.
