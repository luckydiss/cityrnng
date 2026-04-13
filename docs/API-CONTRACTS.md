# API Contracts MVP: CITYRNNG

## 1. Общие правила

- API versioning: `/api/v1`
- формат: JSON
- auth: Bearer access token
- ошибки: стандартный envelope с `code`, `message`, `details`

## 2. Auth

### `POST /api/v1/auth/request-login`

Назначение:

- отправить magic link или код входа

Request:

```json
{
  "email": "user@example.com"
}
```

### `POST /api/v1/auth/verify-login`

```json
{
  "token": "opaque-token"
}
```

Response:

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "roles": ["runner"]
  }
}
```

### `POST /api/v1/auth/refresh`

### `POST /api/v1/auth/logout`

## 3. Profile

### `GET /api/v1/me`

### `PATCH /api/v1/me/profile`

```json
{
  "displayName": "Антон",
  "city": "Уфа",
  "instagramHandle": "anton.run"
}
```

## 4. Events

### `GET /api/v1/events`

Фильтры:

- `status`
- `from`
- `to`
- `type`

### `GET /api/v1/events/:id`

### `POST /api/v1/events/:id/register`

Response:

```json
{
  "registrationId": "reg_123",
  "status": "registered"
}
```

### `DELETE /api/v1/events/:id/register`

## 5. Check-in

### `POST /api/v1/checkins/scan`

```json
{
  "token": "qr-token"
}
```

Response:

```json
{
  "checkinId": "chk_123",
  "status": "pending"
}
```

### `POST /api/v1/admin/checkins/:id/confirm`

### `POST /api/v1/admin/checkins/:id/reject`

## 6. Points

### `GET /api/v1/points/balance`

Response:

```json
{
  "balance": 650
}
```

### `GET /api/v1/points/transactions`

### `POST /api/v1/admin/points/adjust`

```json
{
  "userId": "usr_123",
  "direction": "credit",
  "amount": 100,
  "comment": "Volunteer bonus"
}
```

## 7. Rewards

### `GET /api/v1/rewards`

Фильтры:

- `partnerId`
- `status`
- `affordableOnly`

### `GET /api/v1/rewards/:id`

### `POST /api/v1/rewards/:id/redeem`

Response:

```json
{
  "redemptionId": "red_123",
  "status": "reserved",
  "code": "CITY-8JKL9",
  "expiresAt": "2026-05-01T12:00:00.000Z"
}
```

### `GET /api/v1/me/redemptions`

## 8. Partners

### `GET /api/v1/partners`

### `GET /api/v1/partners/:id`

### `POST /api/v1/partner/redemptions/:id/verify`

Назначение:

- партнер подтверждает использование reward

## 9. Admin

### `POST /api/v1/admin/events`

### `PATCH /api/v1/admin/events/:id`

### `POST /api/v1/admin/events/:id/publish`

### `POST /api/v1/admin/events/:id/checkin-token`

Response:

```json
{
  "token": "short-lived-token",
  "expiresAt": "2026-04-13T14:00:00.000Z"
}
```

### `POST /api/v1/admin/rewards`

### `PATCH /api/v1/admin/rewards/:id`

### `POST /api/v1/admin/partners`

### `PATCH /api/v1/admin/partners/:id`

## 10. Health

### `GET /api/v1/health`

```json
{
  "status": "ok"
}
```

## 11. Error format

```json
{
  "error": {
    "code": "INSUFFICIENT_POINTS",
    "message": "Not enough points to redeem this reward",
    "details": {}
  }
}
```

## 12. Критичные доменные коды ошибок

- `AUTH_INVALID_TOKEN`
- `AUTH_SESSION_EXPIRED`
- `EVENT_NOT_OPEN`
- `EVENT_ALREADY_REGISTERED`
- `CHECKIN_TOKEN_EXPIRED`
- `CHECKIN_ALREADY_EXISTS`
- `POINTS_DUPLICATE_IDEMPOTENCY_KEY`
- `INSUFFICIENT_POINTS`
- `REWARD_NOT_AVAILABLE`
- `REWARD_ALREADY_REDEEMED`
- `FORBIDDEN_ROLE`
