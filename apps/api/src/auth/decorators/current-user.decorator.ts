/*
# FILE: apps/api/src/auth/decorators/current-user.decorator.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Предоставляет вспомогательные decorators для домена auth.
# SCOPE: Decorator layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Decorator; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CONST 4 [Константа или конфигурационное значение модуля.] => CurrentUser
# END_MODULE_MAP
# START_USE_CASES:
#- [current-user.decorator]: NestJS Metadata Pipeline -> SupportRuntimeConfiguration -> ContextPrepared
# END_USE_CASES
*/

import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { AuthenticatedUser } from "../types";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (!req.user) {
      throw new Error("CurrentUser used on a route without an authenticated user");
    }
    return req.user;
  },
);
