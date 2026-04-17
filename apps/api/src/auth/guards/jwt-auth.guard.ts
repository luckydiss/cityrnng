/*
# FILE: apps/api/src/auth/guards/jwt-auth.guard.ts
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
# CLASS 9 [Основной класс модуля.] => JwtAuthGuard
# METHOD 7 [Метод класса JwtAuthGuard.] => constructor
# METHOD 7 [Метод класса JwtAuthGuard.] => canActivate
# FUNC 7 [Функция уровня модуля.] => extractBearer
# END_MODULE_MAP
# START_USE_CASES:
#- [JwtAuthGuard.canActivate]: NestJS Security Pipeline -> ExecuteCanActivate -> BusinessResultPrepared
#- [extractBearer]: NestJS Security Pipeline -> ExecuteExtractBearer -> ResultPrepared
# END_USE_CASES
*/

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import type { Env } from "../../config/env.schema";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { AccessTokenPayload, AuthenticatedUser } from "../types";

// START_CLASS_JwtAuthGuard
/*
# START_CONTRACT:
# PURPOSE: Проверяет правила доступа и ограничения безопасности домена auth.
# ATTRIBUTES:
# - [Атрибут класса JwtAuthGuard.] => reflector: Reflector
# - [Атрибут класса JwtAuthGuard.] => jwt: JwtService
# - [Атрибут класса JwtAuthGuard.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Выполняет операцию canActivate в домене auth.] => canActivate()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class JwtAuthGuard implements CanActivate {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_canActivate
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию canActivate в домене auth.
  # INPUTS:
  # - [Входной параметр canActivate.] => ctx: ExecutionContext
  # OUTPUTS:
  # - [Promise<boolean>] - [Возвращаемое значение операции canActivate.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция canActivate завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<boolean>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): config.get; CALLS(7): getHandler; CALLS(7): getClass; CALLS(7): switchToHttp]
  # END_CONTRACT
  */
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_ACCESS_DATA_STORE_02: [Выполняет операции чтения или записи в хранилище данных.]
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = extractBearer(req);
    if (!token) throw new UnauthorizedException({ code: "AUTH_INVALID_TOKEN" });
    // END_BLOCK_ACCESS_DATA_STORE_02

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.get("JWT_ACCESS_SECRET", { infer: true }),
      });
      req.user = { id: payload.sub, email: payload.email, roles: payload.roles ?? [] };
      return true;
    } catch {
      throw new UnauthorizedException({ code: "AUTH_SESSION_EXPIRED" });
    }
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_canActivate

}
// END_CLASS_JwtAuthGuard


// START_FUNCTION_extractBearer
/*
# START_CONTRACT:
# PURPOSE: Выполняет операцию extractBearer в домене auth.
# INPUTS:
# - [Входной параметр extractBearer.] => req: Request
# OUTPUTS:
# - [string | null] - [Возвращаемое значение операции extractBearer.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция extractBearer завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу string | null.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Guard; TYPE(6): Function]
# LINKS: [CALLS(7): split; CALLS(7): toLowerCase; CALLS(7): trim]
# END_CONTRACT
*/
function extractBearer(req: Request): string | null {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
  // END_BLOCK_MAIN
}
// END_FUNCTION_extractBearer
