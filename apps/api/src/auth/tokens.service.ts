/*
# FILE: apps/api/src/auth/tokens.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена auth.
# SCOPE: Service layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => TokensService
# METHOD 7 [Метод класса TokensService.] => constructor
# METHOD 7 [Метод класса TokensService.] => issue
# FUNC 7 [Функция уровня модуля.] => hashRefresh
# TYPE 5 [Тип или интерфейс прикладного контракта.] => IssuedTokens
# END_MODULE_MAP
# START_USE_CASES:
#- [TokensService.issue]: Application Service (Business Flow) -> ExecuteIssue -> BusinessResultPrepared
#- [hashRefresh]: Application Service (Business Flow) -> ExecuteHashRefresh -> ResultPrepared
# END_USE_CASES
*/

import { createHash, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Env } from "../config/env.schema";
import type { AccessTokenPayload } from "./types";

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

// START_CLASS_TokensService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена auth.
# ATTRIBUTES:
# - [Атрибут класса TokensService.] => jwt: JwtService
# - [Атрибут класса TokensService.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Создает новый challenge или токен для сценария аутентификации.] => issue()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class TokensService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_issue
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новый challenge или токен для сценария аутентификации.
  # INPUTS:
  # - [Входной параметр issue.] => user: { id: string; email: string; roles: string[] }
  # OUTPUTS:
  # - [Promise<IssuedTokens>] - [Возвращаемое значение операции issue.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция issue завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<IssuedTokens>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): jwt.signAsync; CALLS(7): config.get; CALLS(7): signAsync; CALLS(7): get]
  # END_CONTRACT
  */
  async issue(user: { id: string; email: string; roles: string[] }): Promise<IssuedTokens> {
    // START_BLOCK_PREPARE_CONTEXT: [Подготавливает исходные данные и локальный контекст выполнения.]
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, roles: user.roles } satisfies AccessTokenPayload,
      {
        secret: this.config.get("JWT_ACCESS_SECRET", { infer: true }),
        expiresIn: this.config.get("ACCESS_TOKEN_TTL", { infer: true }),
      },
    );
    // END_BLOCK_PREPARE_CONTEXT

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const refreshToken = randomBytes(48).toString("base64url");
    const refreshTokenHash = hashRefresh(refreshToken);
    const ttlDays = this.config.get("REFRESH_TOKEN_TTL_DAYS", { infer: true });
    const refreshTokenExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return { accessToken, refreshToken, refreshTokenHash, refreshTokenExpiresAt };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_issue

}
// END_CLASS_TokensService


// START_FUNCTION_hashRefresh
/*
# START_CONTRACT:
# PURPOSE: Формирует детерминированное представление данных для домена auth.
# INPUTS:
# - [Входной параметр hashRefresh.] => token: string
# OUTPUTS:
# - [string] - [Возвращаемое значение операции hashRefresh.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция hashRefresh завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу string.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): createHash; CALLS(7): update; CALLS(7): digest]
# END_CONTRACT
*/
export function hashRefresh(token: string): string {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  return createHash("sha256").update(token).digest("hex");
  // END_BLOCK_MAIN
}
// END_FUNCTION_hashRefresh
