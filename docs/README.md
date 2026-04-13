# CITYRNNG Project Docs

Этот пакет подготовлен как `agent-ready` база для cloud-агента и команды разработки.
Он покрывает продуктовую рамку, архитектуру, модель данных, backlog и стартовый промпт.

## Состав

- [PRD.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/PRD.md) - продуктовая спецификация, роли, MVP, user flows
- [ARCHITECTURE.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/ARCHITECTURE.md) - стек, monorepo, инфраструктура, модули, нефункциональные требования
- [ERD.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/ERD.md) - сущности, связи, правила данных, транзакционная модель баллов
- [BACKLOG.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/BACKLOG.md) - эпики, задачи, порядок реализации, definition of done
- [API-CONTRACTS.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/API-CONTRACTS.md) - начальные API-контракты MVP
- [CLOUD_AGENT_MASTER_PROMPT.md](C:/Users/Vivobook/Desktop/Проекты/ctyrnng/docs/CLOUD_AGENT_MASTER_PROMPT.md) - мастер-промпт для cloud-агента

## Как использовать

1. Сначала агент читает `PRD.md` и `ARCHITECTURE.md`.
2. Затем опирается на `ERD.md` и `API-CONTRACTS.md` для реализации backend и shared types.
3. После этого идет по `BACKLOG.md` эпик за эпиком.
4. Для автономной работы агенту можно выдать содержимое `CLOUD_AGENT_MASTER_PROMPT.md`.

## Принципы запуска

- Сначала реализуется крепкий MVP, а не полный enterprise.
- Баллы проектируются как журнал транзакций, а не как простое числовое поле.
- Основа продукта: комьюнити, регулярность, события, партнеры, rewards.
- Базовая архитектура: модульный монолит с возможностью последующего выделения сервисов.
