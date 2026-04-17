/*
# FILE: apps/api/src/auth/guards/roles.guard.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Проверяет правила доступа и ограничения безопасности домена auth.
# SCOPE: Guard layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => RolesGuard
# METHOD 7 [Метод класса RolesGuard.] => constructor
# METHOD 7 [Метод класса RolesGuard.] => canActivate
# END_MODULE_MAP
# START_USE_CASES:
#- [RolesGuard.canActivate]: NestJS Security Pipeline -> ExecuteCanActivate -> BusinessResultPrepared
# END_USE_CASES
*/

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../types";

// START_CLASS_RolesGuard
/*
# START_CONTRACT:
# PURPOSE: Проверяет правила доступа и ограничения безопасности домена auth.
# ATTRIBUTES:
# - [Атрибут класса RolesGuard.] => reflector: Reflector) {}
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Выполняет операцию canActivate в домене auth.] => canActivate()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class RolesGuard implements CanActivate {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly reflector: Reflector) {}
  // END_METHOD_constructor


  
  // START_METHOD_canActivate
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию canActivate в домене auth.
  # INPUTS:
  # - [Входной параметр canActivate.] => ctx: ExecutionContext
  # OUTPUTS:
  # - [boolean] - [Возвращаемое значение операции canActivate.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция canActivate завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу boolean.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): getHandler; CALLS(7): getClass; CALLS(7): switchToHttp; CALLS(7): some]
  # END_CONTRACT
  */
  canActivate(ctx: ExecutionContext): boolean {
    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const required = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const roles = req.user?.roles ?? [];
    if (!roles.some((r) => required.includes(r))) {
      throw new ForbiddenException({ code: "FORBIDDEN_ROLE" });
    }
    return true;
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_canActivate

}
// END_CLASS_RolesGuard
