/*
# FILE: apps/api/src/auth/types.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Содержит общие типы и контракты домена auth.
# SCOPE: Types layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Types; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# TYPE 5 [Тип или интерфейс прикладного контракта.] => AuthenticatedUser
# TYPE 5 [Тип или интерфейс прикладного контракта.] => AccessTokenPayload
# TYPE 5 [Тип или интерфейс прикладного контракта.] => RoleCode
# CONST 4 [Константа или конфигурационное значение модуля.] => ROLE_RUNNER
# CONST 4 [Константа или конфигурационное значение модуля.] => ROLE_ADMIN
# CONST 4 [Константа или конфигурационное значение модуля.] => ROLE_PARTNER
# END_MODULE_MAP
# START_USE_CASES:
#- [types]: Application Layer -> SupportRuntimeConfiguration -> ContextPrepared
# END_USE_CASES
*/

export const ROLE_RUNNER = "runner";
export const ROLE_ADMIN = "admin";
export const ROLE_PARTNER = "partner";

export type RoleCode = typeof ROLE_RUNNER | typeof ROLE_ADMIN | typeof ROLE_PARTNER | string;

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
}
