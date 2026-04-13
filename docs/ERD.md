# ERD and Data Model: CITYRNNG

## 1. Основные сущности

### Users and identity

- `users`
- `profiles`
- `roles`
- `user_roles`
- `auth_identities`
- `sessions`

### Events

- `events`
- `event_routes`
- `event_registrations`
- `checkins`
- `checkin_tokens`

### Loyalty

- `point_accounts`
- `point_transactions`
- `point_rules`

### Rewards and partners

- `partners`
- `partner_contacts`
- `rewards`
- `reward_inventory`
- `reward_redemptions`
- `reward_redemption_events`

### Platform

- `notifications`
- `media_files`
- `audit_logs`
- `feature_flags`

## 2. Таблицы и ключевые поля

## `users`

- `id`
- `email`
- `phone` nullable
- `status` active|blocked|pending
- `created_at`
- `updated_at`

## `profiles`

- `id`
- `user_id` unique
- `display_name`
- `first_name`
- `last_name`
- `city`
- `birth_date` nullable
- `avatar_media_id` nullable
- `instagram_handle` nullable
- `telegram_handle` nullable
- `consent_personal_data_at`
- `consent_marketing_at` nullable

## `roles`

- `id`
- `code`
- `name`

## `user_roles`

- `user_id`
- `role_id`

## `events`

- `id`
- `title`
- `slug`
- `description`
- `type` regular|special|partner
- `status` draft|published|started|finished|cancelled
- `starts_at`
- `ends_at`
- `location_name`
- `location_address`
- `location_lat`
- `location_lng`
- `capacity` nullable
- `registration_open_at`
- `registration_close_at`
- `checkin_mode` qr|manual
- `is_points_eligible`
- `base_points_award`
- `created_by`

## `event_routes`

- `id`
- `event_id`
- `title`
- `distance_km`
- `pace_from` nullable
- `pace_to` nullable
- `notes`

## `event_registrations`

- `id`
- `event_id`
- `user_id`
- `status` registered|waitlist|cancelled|attended|missed
- `registered_at`
- `cancelled_at` nullable
- unique(`event_id`, `user_id`)

## `checkin_tokens`

- `id`
- `event_id`
- `token_hash`
- `expires_at`
- `created_by`
- `created_at`
- `status` active|expired|revoked

## `checkins`

- `id`
- `event_id`
- `user_id`
- `registration_id` nullable
- `token_id` nullable
- `source` qr|manual|admin
- `status` pending|confirmed|rejected
- `checked_in_at`
- `confirmed_at` nullable
- `confirmed_by` nullable
- unique(`event_id`, `user_id`)

## `point_accounts`

- `id`
- `user_id` unique
- `status` active|blocked
- `created_at`

## `point_transactions`

- `id`
- `account_id`
- `user_id`
- `direction` credit|debit
- `amount`
- `balance_after`
- `status` pending|posted|reversed
- `reason_type`
- `reason_id` nullable
- `idempotency_key` unique
- `comment` nullable
- `created_by_type` system|user|admin
- `created_by_id` nullable
- `created_at`

`reason_type` примеры:

- `signup_bonus`
- `first_run_bonus`
- `event_attendance`
- `special_event_bonus`
- `referral_bonus`
- `reward_redemption`
- `manual_adjustment`
- `reversal`

## `point_rules`

- `id`
- `code`
- `name`
- `status`
- `config_json`
- `effective_from`
- `effective_to` nullable

## `partners`

- `id`
- `name`
- `slug`
- `description`
- `status` draft|active|inactive
- `logo_media_id` nullable
- `website_url` nullable
- `instagram_url` nullable
- `city`

## `partner_contacts`

- `id`
- `partner_id`
- `name`
- `email`
- `phone`
- `role`

## `rewards`

- `id`
- `partner_id`
- `title`
- `slug`
- `description`
- `status` draft|active|inactive|archived
- `points_cost`
- `redemption_mode` code|qr|manual
- `validity_days`
- `terms_text`
- `starts_at` nullable
- `ends_at` nullable
- `per_user_limit` nullable
- `daily_limit` nullable
- `total_limit` nullable
- `cover_media_id` nullable

## `reward_inventory`

- `id`
- `reward_id`
- `available_qty`
- `reserved_qty`
- `used_qty`

## `reward_redemptions`

- `id`
- `reward_id`
- `partner_id`
- `user_id`
- `point_transaction_id`
- `status` created|reserved|redeemed|cancelled|expired
- `code`
- `qr_payload` nullable
- `reserved_at`
- `redeemed_at` nullable
- `expires_at` nullable

## `reward_redemption_events`

- `id`
- `redemption_id`
- `event_type`
- `payload_json`
- `created_at`

## `notifications`

- `id`
- `user_id`
- `channel` email|telegram|push|internal
- `template_code`
- `status` queued|sent|failed
- `payload_json`
- `sent_at` nullable

## `audit_logs`

- `id`
- `actor_type`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `payload_json`
- `created_at`

## 3. Ключевые связи

- `users 1:1 profiles`
- `users 1:N sessions`
- `users N:M roles`
- `users 1:N event_registrations`
- `users 1:N checkins`
- `users 1:1 point_accounts`
- `users 1:N point_transactions`
- `partners 1:N rewards`
- `rewards 1:N reward_redemptions`
- `events 1:N event_routes`
- `events 1:N event_registrations`
- `events 1:N checkins`

## 4. Транзакционная модель баллов

Баллы нельзя хранить только как вычисляемое поле в `users`.

Правильная схема:

- основной источник истины: `point_transactions`;
- `point_accounts` хранит статус счета;
- `balance_after` фиксирует итог после каждой операции;
- списание возможно только внутри транзакции БД с проверкой достаточности баланса;
- все отмены выполняются отдельной обратной записью.

## 5. Правила целостности

- один пользователь не может дважды зарегистрироваться на одно и то же событие;
- один пользователь не может получить два подтвержденных check-in на одно событие;
- одна и та же причина начисления не должна выполняться дважды при одинаковом `idempotency_key`;
- redemption не может быть создан, если баллов недостаточно;
- redemption не может быть переведен в `redeemed` повторно;
- ручная корректировка баллов только для ролей `admin` и `superadmin`.

## 6. Событийная модель

Стоит логировать важные доменные события:

- `user_signed_up`
- `event_created`
- `runner_registered_for_event`
- `runner_checked_in`
- `checkin_confirmed`
- `points_awarded`
- `reward_redeemed`
- `reward_used`
- `manual_points_adjusted`

Это упростит аналитику и отладку.

## 7. Что важно для Prisma schema

- использовать `@@unique` для доменных ограничений;
- вынести enum в Prisma;
- аудируемые поля добавлять во все критичные таблицы;
- для денежных/балльных значений использовать `Int`;
- мягкое удаление лучше через `status`, а не hard delete.
