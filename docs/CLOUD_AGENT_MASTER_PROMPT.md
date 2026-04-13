# Master Prompt for Cloud Agent: CITYRNNG

Ниже текст, который можно использовать как основной промпт для cloud-агента.

---

Ты разрабатываешь продукт `CITYRNNG` с нуля в пустом репозитории.

## Цель продукта

Это платформа городского бегового сообщества. Пользователь должен иметь возможность:

- зарегистрироваться;
- создать аккаунт;
- записываться на пробежки;
- проходить check-in на событиях;
- получать баллы за участие;
- обменивать баллы на предложения партнеров;
- видеть свою историю активности и rewards.

## Технологический стек

- Monorepo: `pnpm + Turborepo`
- Frontend: `Next.js 15 + TypeScript + Tailwind`
- Backend: `NestJS + TypeScript`
- ORM: `Prisma`
- Database: `PostgreSQL`
- Cache / queues: `Redis + BullMQ`
- Infra: `Docker`, `Docker Compose`, `Terraform`
- CI/CD: `GitHub Actions`

## Основные архитектурные правила

- Используй модульный монолит, не микросервисы.
- Сначала создай foundation проекта, потом доменные модули.
- Баллы проектируй только как `ledger` через таблицу `point_transactions`.
- Не храни баллы только в профиле пользователя.
- Все критичные операции должны быть идемпотентными.
- Все ручные админские изменения баллов должны попадать в audit log.
- Выделяй shared types в `packages/types`.
- Создавай production-friendly код, но без избыточной сложности.

## Источники истины

Перед реализацией прочитай документы:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/ERD.md`
- `docs/API-CONTRACTS.md`
- `docs/BACKLOG.md`

Если видишь противоречие:

1. Приоритет у `PRD.md`
2. Затем `ARCHITECTURE.md`
3. Затем `ERD.md`
4. Затем `API-CONTRACTS.md`
5. Затем `BACKLOG.md`

## Порядок работы

Работай по эпикам из `docs/BACKLOG.md`.

### Phase 1

Подними monorepo:

- `apps/web`
- `apps/api`
- `packages/ui`
- `packages/types`
- `packages/config`
- `infra`

Настрой:

- workspace config
- TypeScript
- lint
- format
- env handling
- Docker Compose с PostgreSQL и Redis

### Phase 2

Реализуй auth и profiles:

- базовые сущности пользователей и ролей
- protected routes
- `/me`
- auth flow

### Phase 3

Реализуй events, registrations и check-in:

- CRUD событий
- запись на событие
- QR-based check-in

### Phase 4

Реализуй points engine:

- point account
- transaction ledger
- welcome bonus
- first run bonus
- attendance points
- manual adjustments

### Phase 5

Реализуй partners и rewards:

- rewards catalog
- redemption flow
- partner verification

### Phase 6

Реализуй admin panel, marketing pages, notifications и analytics.

## Требования к качеству

- Каждый эпик должен завершаться работающим вертикальным срезом.
- После каждого эпика обновляй README и `.env.example`, если меняются команды или переменные окружения.
- Пиши минимально достаточные тесты.
- Не оставляй заглушки без комментария `TODO` и объяснения.
- Не добавляй код, который не используется.

## Требования к frontend

- UI должен ощущаться как городской lifestyle-проект, а не корпоративная CRM.
- На главной странице должны быть ближайшие события, объяснение механики баллов и блок партнеров.
- Личный кабинет должен фокусироваться на активности, балансе и rewards.
- Admin UI может быть проще, но должен быть быстрым и понятным.

## Требования к backend

- NestJS modules по доменам.
- Prisma schema должна отражать ограничения из `docs/ERD.md`.
- Для баллов используй транзакции БД.
- Для side effects используй очереди.
- Реализуй health endpoint.

## Definition of done для каждой задачи

- код собирается;
- линт проходит;
- типы корректны;
- базовые тесты есть;
- документация не устарела;
- сценарий можно проверить локально.

## Формат работы

- Сначала предложи структуру файлов и первый вертикальный срез.
- Затем реализуй foundation.
- После foundation переходи эпик за эпиком.
- Если выбор между простотой и абстракцией неочевиден, выбирай более простой и прозрачный вариант.

---

Короткая инструкция агенту:

Начни с `Epic 0`, создай monorepo и инфраструктурный каркас, затем переходи к auth и profiles. Не перепридумывай архитектуру, а следуй документам из `docs/`.
