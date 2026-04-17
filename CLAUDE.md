# CITYRNNG - Claude Project Instructions

This file is the Claude-specific entrypoint. The cross-agent contract lives in `AGENTS.md` and is mandatory.

## Mandatory bootstrap

Before any analysis, answer, code edit, refactor, debug session, or review:

1. Read `AGENTS.md`.
2. Resolve the shared rules pack using this search order:
   - `./.skills/`
   - `./skills/`
3. Treat the first existing directory from that list as the canonical agent skill-pack.
4. Read and obey all mandatory rule files referenced by `AGENTS.md`.
5. If the rules pack cannot be found, stop and report that the session is blocked.

## Priority

For work inside `CITYRNNG`, the local agent protocol from `AGENTS.md` and the resolved skills pack is mandatory and overrides Claude's default coding preferences, except for any higher-priority platform or system constraints that Claude cannot bypass.

Claude must not silently simplify, skip, or reinterpret the local rule system.

## Project source of truth

Read these documents for product and architecture context:

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
- Before major implementation, propose a short file-level plan unless stricter local rules require a heavier planning artifact.
- Keep changes scoped to the current task.
- Update docs when API, env vars, or workflows change.
- Prefer simple and transparent solutions over clever abstractions.

## Delivery rules

- Every completed task must leave the repo structurally valid.
- Add or update `.env.example` when introducing new environment variables.
- Add tests for critical business logic, especially points and rewards.
- Report what was changed, how to run it, and known gaps.
- If the local skills pack requires semantic annotations or XML graph updates, those are part of done criteria.

## Git and deployment rules

- Never push directly to `main`.
- Work only in feature branches.
- Use conventional commit messages like `feat:`, `fix:`, `chore:`.
- Do not rewrite history unless explicitly asked.
- Do not edit production servers manually.
- `main` deploys automatically to staging only.
- Production deploy must be manual.
- Database migrations must run as part of deploy.
- Health check must run after deploy.

## Design rules

- Public UI should feel like a city lifestyle community, not a corporate dashboard.
- Runner dashboard should highlight next events, points, and rewards.
- Admin UI can be more utilitarian but must stay clear and fast.
