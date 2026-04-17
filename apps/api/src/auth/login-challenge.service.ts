/*
# FILE: apps/api/src/auth/login-challenge.service.ts
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
# CLASS 9 [Основной класс модуля.] => LoginChallengeService
# METHOD 7 [Метод класса LoginChallengeService.] => constructor
# METHOD 7 [Метод класса LoginChallengeService.] => issue
# METHOD 7 [Метод класса LoginChallengeService.] => consume
# FUNC 7 [Функция уровня модуля.] => hashToken
# TYPE 5 [Тип или интерфейс прикладного контракта.] => IssuedChallenge
# END_MODULE_MAP
# START_USE_CASES:
#- [LoginChallengeService.issue]: Application Service (Business Flow) -> ExecuteIssue -> BusinessResultPrepared
#- [LoginChallengeService.consume]: Application Service (Business Flow) -> ExecuteConsume -> BusinessResultPrepared
#- [hashToken]: Application Service (Business Flow) -> ExecuteHashToken -> ResultPrepared
# END_USE_CASES
*/

import { randomBytes, createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import type { Env } from "../config/env.schema";

export interface IssuedChallenge {
  token: string;
  expiresAt: Date;
}

// START_CLASS_LoginChallengeService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена auth.
# ATTRIBUTES:
# - [Атрибут класса LoginChallengeService.] => prisma: PrismaService
# - [Атрибут класса LoginChallengeService.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Создает новый challenge или токен для сценария аутентификации.] => issue()
# - [Проверяет токен и помечает его использованным.] => consume()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class LoginChallengeService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_issue
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новый challenge или токен для сценария аутентификации.
  # INPUTS:
  # - [Входной параметр issue.] => email: string
  # OUTPUTS:
  # - [Promise<IssuedChallenge>] - [Возвращаемое значение операции issue.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция issue завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<IssuedChallenge>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): config.get; CALLS(7): prisma.loginChallenge.create; CALLS(7): randomBytes; CALLS(7): toString]
  # END_CONTRACT
  */
  async issue(email: string): Promise<IssuedChallenge> {
    // START_BLOCK_PREPARE_CONTEXT: [Подготавливает исходные данные и локальный контекст выполнения.]
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const ttlMinutes = this.config.get("LOGIN_CHALLENGE_TTL_MINUTES", { infer: true });
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
    // END_BLOCK_PREPARE_CONTEXT

    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    await this.prisma.loginChallenge.create({
      data: { email, tokenHash, expiresAt },
    });
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return { token, expiresAt };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_issue


  
  // START_METHOD_consume
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет токен и помечает его использованным.
  # INPUTS:
  # - [Входной параметр consume.] => token: string
  # OUTPUTS:
  # - [Promise<{ email: string } | null>] - [Возвращаемое значение операции consume.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция consume завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<{ email: string } | null>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.loginChallenge.findUnique; CALLS(7): prisma.loginChallenge.updateMany; CALLS(7): hashToken; CALLS(7): findUnique]
  # END_CONTRACT
  */
  async consume(token: string): Promise<{ email: string } | null> {
    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const tokenHash = hashToken(token);
    const challenge = await this.prisma.loginChallenge.findUnique({ where: { tokenHash } });
    if (!challenge) return null;
    if (challenge.consumedAt) return null;
    if (challenge.expiresAt.getTime() <= Date.now()) return null;
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_ACCESS_DATA_STORE_02: [Выполняет операции чтения или записи в хранилище данных.]
    const updated = await this.prisma.loginChallenge.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (updated.count === 0) return null;
    // END_BLOCK_ACCESS_DATA_STORE_02

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return { email: challenge.email };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_consume

}
// END_CLASS_LoginChallengeService


// START_FUNCTION_hashToken
/*
# START_CONTRACT:
# PURPOSE: Формирует детерминированное представление данных для домена auth.
# INPUTS:
# - [Входной параметр hashToken.] => token: string
# OUTPUTS:
# - [string] - [Возвращаемое значение операции hashToken.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция hashToken завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу string.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): createHash; CALLS(7): update; CALLS(7): digest]
# END_CONTRACT
*/
export function hashToken(token: string): string {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  return createHash("sha256").update(token).digest("hex");
  // END_BLOCK_MAIN
}
// END_FUNCTION_hashToken
