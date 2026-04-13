# Deploy Scripts Contract

Workflow templates expect deploy scripts to exist on the target hosts.

## Staging

Expected path:

- `${STAGING_APP_DIR}/deploy-staging.sh`

Expected behavior:

- log in to registry if needed;
- pull `$IMAGE`;
- update compose or container runtime config;
- run Prisma migrations;
- restart application;
- exit non-zero on failure.

## Production

Expected path:

- `${PROD_APP_DIR}/deploy-production.sh`

Expected behavior:

- log in to registry if needed;
- pull `$IMAGE`;
- run backup or preflight checks if required;
- run Prisma migrations;
- restart application;
- exit non-zero on failure.

## Recommendation

Keep server-side deploy scripts tiny and deterministic.
The application code should be delivered by Docker image, not by `git pull` on the server.
