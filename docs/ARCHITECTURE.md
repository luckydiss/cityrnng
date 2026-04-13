# Technical Architecture: CITYRNNG

## 1. Архитектурный подход

Стартовая архитектура: `modular monolith`.

Причины:

- быстрее и безопаснее для MVP;
- меньше операционной сложности для cloud-агента;
- проще тестировать транзакционную бизнес-логику;
- позже можно выделить сервисы `notifications`, `rewards`, `analytics`, если появится нагрузка.

## 2. Рекомендуемый стек

### Frontend

- `Next.js 15`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui` как основа админских и кабинетных компонентов
- `React Hook Form + Zod`
- `TanStack Query`

### Backend

- `NestJS`
- `TypeScript`
- `Prisma ORM`
- `PostgreSQL`
- `Redis`
- `BullMQ` для фоновых задач

### Shared / Platform

- `pnpm`
- `Turborepo`
- `ESLint`
- `Prettier`
- `Vitest`
- `Playwright`

### Infra

- `Docker`
- `Docker Compose` для local dev
- `Yandex Cloud` как основная облачная платформа
- `Terraform` для инфраструктуры
- `Nginx` как reverse proxy
- `GitHub Actions` для CI/CD

### Observability

- `Sentry`
- `PostHog`
- `Yandex Metrica`
- базовые infra-метрики: `Grafana + Prometheus` или managed equivalent

## 3. Monorepo structure

```text
/
  apps/
    web/
    api/
  packages/
    ui/
    types/
    config/
  infra/
    terraform/
    docker/
    scripts/
  docs/
```

## 4. Apps

### `apps/web`

Задачи:

- публичный сайт;
- личный кабинет runner;
- кабинет partner manager;
- admin UI;
- SSR/SEO для публичных страниц.

Основные зоны:

- `(marketing)` публичные страницы;
- `(app)` кабинет участника;
- `(partner)` кабинет партнера;
- `(admin)` админка.

### `apps/api`

Задачи:

- REST API для web;
- auth;
- бизнес-логика баллов и rewards;
- check-in;
- notifications;
- audit log;
- admin operations.

## 5. Packages

### `packages/ui`

- дизайн-система;
- базовые компоненты;
- layout primitives;
- таблицы, формы, badges, cards, dialog, toast.

### `packages/types`

- общие DTO;
- enum;
- контракты API;
- типы ролей, событий, rewards, транзакций.

### `packages/config`

- общие конфиги TypeScript;
- ESLint presets;
- Prettier config.

## 6. Backend modules

- `auth`
- `users`
- `profiles`
- `events`
- `event-registrations`
- `checkins`
- `points`
- `rewards`
- `partners`
- `notifications`
- `files`
- `admin`
- `audit`
- `health`

## 7. Data flow

### Регистрация

1. `web` отправляет email / passwordless request.
2. `api/auth` создает challenge.
3. После верификации создается `user`, `profile`, `point_account`.
4. Записывается welcome transaction.

### Check-in на событии

1. Event manager открывает экран активного события.
2. Система генерирует короткоживущий QR token.
3. Runner сканирует QR.
4. `api/checkins` проверяет регистрацию, статус события и срок действия токена.
5. Создается `checkin`.
6. После подтверждения триггерится начисление в `points`.

### Redemption

1. Runner выбирает reward.
2. `api/rewards` проверяет доступность и достаточность баллов.
3. Создается redemption.
4. `api/points` пишет debit transaction.
5. Генерируется код или QR для использования у партнера.

## 8. Инфраструктура

## Production MVP

- `web` и `api` могут стартовать на одной VM через Docker Compose
- PostgreSQL лучше managed
- Redis либо managed, либо отдельный контейнер на первой стадии
- S3-совместимое хранилище для фото, медиа и QR-assets

### Минимальная production-конфигурация

- app VM: `2 vCPU / 4 GB RAM`
- managed PostgreSQL: `2 vCPU / 8 GB RAM`
- Redis: `1 GB`
- object storage: `50 GB`
- daily backups

### Сети и безопасность

- private network между app и managed DB;
- доступ к admin только через auth и role guard;
- secrets только через environment variables и secret storage;
- HTTPS обязательно;
- CORS строго по списку доменов;
- rate limiting для auth, check-in и reward redemption.

## 9. Deployment strategy

### Environments

- `local`
- `staging`
- `production`

### CI

- install
- lint
- typecheck
- unit tests
- integration tests
- build

### CD

- deploy to staging on merge into `develop` или `main` в раннем этапе
- manual approval для production
- миграции Prisma перед переключением версии

## 10. Auth strategy

На MVP:

- email magic link или passwordless code

Альтернатива:

- email + password, если команде удобнее и нужен более привычный поток

Рекомендация:

- начать с magic link, чтобы снизить трение входа

Требования:

- refresh token rotation;
- session invalidation;
- audit log на входы в admin;
- защита от brute force.

## 11. Нефункциональные требования

- время ответа обычных GET endpoint: до `300-500 ms` при типовой нагрузке;
- критичные операции баллов должны быть атомарны;
- все ручные правки баллов аудируются;
- idempotency для check-in и points awarding;
- логи ошибок с correlation id;
- доступность production: целевой baseline `99.5%+`.

## 12. Security checklist

- RBAC guards;
- DTO validation через Zod или class-validator;
- SQL access только через Prisma;
- sanitize upload metadata;
- signed URLs для приватных файлов при необходимости;
- audit logs для admin actions;
- CSRF protection, если выбрана cookie-based auth;
- secure headers в Nginx;
- backup restore drill минимум раз в квартал.

## 13. Frontend information architecture

### Marketing pages

- `/`
- `/how-it-works`
- `/events`
- `/partners`
- `/about`
- `/faq`
- `/login`
- `/signup`

### App pages

- `/app`
- `/app/profile`
- `/app/events`
- `/app/points`
- `/app/rewards`
- `/app/redemptions`
- `/app/settings`

### Partner pages

- `/partner`
- `/partner/rewards`
- `/partner/redemptions`
- `/partner/verify`

### Admin pages

- `/admin`
- `/admin/users`
- `/admin/events`
- `/admin/checkins`
- `/admin/points`
- `/admin/rewards`
- `/admin/partners`
- `/admin/content`
- `/admin/logs`

## 14. Architectural decisions for cloud-agent

- избегать преждевременных микросервисов;
- сначала API contracts и Prisma schema, потом UI;
- points engine держать изолированным модулем;
- все side effects после транзакции через очереди;
- shared types публиковать из `packages/types`;
- feature flags держать в конфиге или отдельной таблице.
