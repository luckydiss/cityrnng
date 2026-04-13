# GitHub Secrets Checklist

Ниже список секретов, которые стоит завести для `CITYRNNG`.

## 1. Claude / AI

- `ANTHROPIC_API_KEY` - ключ для Claude GitHub integration или workflow automation

## 2. Container registry

- `REGISTRY_URL` - адрес registry
- `REGISTRY_USERNAME` - пользователь registry
- `REGISTRY_PASSWORD` - пароль или token registry
- `IMAGE_NAME` - имя Docker image, например `cityrnng/app`

## 3. Staging deploy

- `STAGING_HOST` - IP или домен staging-сервера
- `STAGING_USER` - SSH user
- `STAGING_SSH_KEY` - приватный SSH key для deploy
- `STAGING_APP_DIR` - директория приложения на сервере, например `/opt/cityrnng`
- `STAGING_ENV_FILE` - содержимое production-like `.env` для staging, если хотите собирать файл из секрета

## 4. Production deploy

- `PROD_HOST` - IP или домен production-сервера
- `PROD_USER` - SSH user
- `PROD_SSH_KEY` - приватный SSH key для deploy
- `PROD_APP_DIR` - директория приложения на сервере, например `/opt/cityrnng`
- `PROD_ENV_FILE` - содержимое `.env` для production, если хотите собирать файл из секрета

## 5. Application secrets

- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `SESSION_SECRET`
- `APP_URL`
- `API_URL`

## 6. Database

- `DATABASE_URL`
- `DIRECT_DATABASE_URL` - если понадобится для Prisma migrate / admin connection

Если staging и prod отличаются, лучше использовать environment-scoped secrets:

- `DATABASE_URL` для `staging`
- `DATABASE_URL` для `production`

## 7. Redis

- `REDIS_URL`

## 8. Object storage

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

## 9. Email / notifications

- `EMAIL_FROM`
- `EMAIL_PROVIDER_API_KEY`

## 10. Monitoring / analytics

- `SENTRY_DSN`
- `POSTHOG_KEY`
- `YANDEX_METRICA_ID`

## 11. Рекомендации по хранению

- используйте GitHub Environments: `staging` и `production`;
- production secret values должны жить только в `production` environment;
- не храните `.env` в репозитории;
- staging и production ключи должны быть разными;
- SSH-ключ для deploy должен иметь минимум прав.
