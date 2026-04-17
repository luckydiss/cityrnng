/*
# FILE: apps/api/src/points/points.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена points.
# SCOPE: Service layer for domain points inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => PointsService
# METHOD 7 [Метод класса PointsService.] => constructor
# METHOD 7 [Метод класса PointsService.] => post
# METHOD 7 [Метод класса PointsService.] => getBalance
# METHOD 7 [Метод класса PointsService.] => listHistory
# FUNC 7 [Функция уровня модуля.] => uniqueTargetIncludes
# TYPE 5 [Тип или интерфейс прикладного контракта.] => PostParams
# TYPE 5 [Тип или интерфейс прикладного контракта.] => HistoryQuery
# END_MODULE_MAP
# START_USE_CASES:
#- [PointsService.post]: Application Service (Business Flow) -> ExecutePost -> BusinessResultPrepared
#- [PointsService.getBalance]: Application Service (Business Flow) -> ExecuteGetBalance -> BusinessResultPrepared
#- [PointsService.listHistory]: Application Service (Business Flow) -> ExecuteListHistory -> BusinessResultPrepared
#- [uniqueTargetIncludes]: Application Service (Business Flow) -> ExecuteUniqueTargetIncludes -> ResultPrepared
# END_USE_CASES
*/

import { ConflictException, Injectable } from "@nestjs/common";
import {
  PointActorType,
  PointDirection,
  PointReasonType,
  PointTransaction,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface PostParams {
  userId: string;
  direction: PointDirection;
  amount: number;
  reasonType: PointReasonType;
  idempotencyKey: string;
  reasonRef?: string | null;
  comment?: string | null;
  actor: { type: PointActorType; id?: string | null };
}

export interface HistoryQuery {
  limit?: number;
  cursor?: string;
}

// START_CLASS_PointsService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена points.
# ATTRIBUTES:
# - [Атрибут класса PointsService.] => prisma: PrismaService) {}
# METHODS:
# - [Выполняет операцию constructor в домене points.] => constructor()
# - [Выполняет операцию post в домене points.] => post()
# - [Получает данные домена points по заданным условиям.] => getBalance()
# - [Возвращает список сущностей или записей домена points.] => listHistory()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class PointsService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly prisma: PrismaService) {}
  // END_METHOD_constructor


  /** Canonical ledger writer. Idempotent on idempotencyKey. */
  
  // START_METHOD_post
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию post в домене points.
  # INPUTS:
  # - [Входной параметр post.] => params: PostParams
  # - [Входной параметр post.] => tx?: Prisma.TransactionClient
  # OUTPUTS:
  # - [Promise<PointTransaction>] - [Возвращаемое значение операции post.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция post завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<PointTransaction>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.$transaction; CALLS(7): isInteger; CALLS(7): Error; CALLS(7): async]
  # END_CONTRACT
  */
  async post(params: PostParams, tx?: Prisma.TransactionClient): Promise<PointTransaction> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    if (!Number.isInteger(params.amount) || params.amount <= 0) {
      throw new Error(`Invalid point amount: ${params.amount}`);
    }
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_VALIDATE_CONDITIONS_02: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const run = async (client: Prisma.TransactionClient) => {
      const existing = await client.pointTransaction.findUnique({
        where: { idempotencyKey: params.idempotencyKey },
      });
      if (existing) return existing;

      const account = await client.pointAccount.upsert({
        where: { userId: params.userId },
        create: { userId: params.userId },
        update: {},
      });
      if (account.status !== "active") {
        throw new ConflictException({ code: "POINTS_ACCOUNT_BLOCKED" });
      }

      const signed = params.direction === PointDirection.credit ? params.amount : -params.amount;
      const updatedAccount = await client.pointAccount.update({
        where: { id: account.id },
        data: { balance: { increment: signed } },
      });

      try {
        return await client.pointTransaction.create({
          data: {
            accountId: account.id,
            userId: params.userId,
            direction: params.direction,
            amount: params.amount,
            balanceAfter: updatedAccount.balance,
            reasonType: params.reasonType,
            reasonRef: params.reasonRef ?? null,
            idempotencyKey: params.idempotencyKey,
            comment: params.comment ?? null,
            createdByType: params.actor.type,
            createdById: params.actor.id ?? null,
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002" &&
          uniqueTargetIncludes(err, "idempotency_key")
        ) {
          const winner = await client.pointTransaction.findUnique({
            where: { idempotencyKey: params.idempotencyKey },
          });
          if (winner) return winner;
        }
        throw err;
      }
    };
    // END_BLOCK_VALIDATE_CONDITIONS_02

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    if (tx) return run(tx);
    return this.prisma.$transaction(run, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_post


  
  // START_METHOD_getBalance
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена points по заданным условиям.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  async getBalance(userId: string): Promise<number> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const account = await this.prisma.pointAccount.findUnique({ where: { userId } });
    return account?.balance ?? 0;
    // END_BLOCK_MAIN
  }
  // END_METHOD_getBalance


  
  // START_METHOD_listHistory
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена points.
  # INPUTS:
  # - [Входной параметр listHistory.] => userId: string
  # - [Входной параметр listHistory.] => query: HistoryQuery
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция listHistory завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.pointTransaction.findMany; CALLS(7): min; CALLS(7): max; CALLS(7): findMany]
  # END_CONTRACT
  */
  async listHistory(userId: string, query: HistoryQuery = {}) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const take = Math.min(100, Math.max(1, query.limit ?? 20));
    const args: Prisma.PointTransactionFindManyArgs = {
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
    };
    if (query.cursor) {
      args.cursor = { id: query.cursor };
      args.skip = 1;
    }
    const rows = await this.prisma.pointTransaction.findMany(args);
    const nextCursor = rows.length > take ? rows[take - 1]!.id : null;
    const page = rows.slice(0, take);
    return {
      items: page.map((t) => ({
        id: t.id,
        direction: t.direction,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        reasonType: t.reasonType,
        reasonRef: t.reasonRef,
        comment: t.comment,
        createdAt: t.createdAt,
      })),
      nextCursor,
    };
    // END_BLOCK_MAIN
  }
  // END_METHOD_listHistory

}
// END_CLASS_PointsService


// START_FUNCTION_uniqueTargetIncludes
/*
# START_CONTRACT:
# PURPOSE: Проверяет наличие имени поля в метаданных Prisma-ошибки уникальности.
# INPUTS:
# - [Входной параметр uniqueTargetIncludes.] => err: Prisma.PrismaClientKnownRequestError
# - [Входной параметр uniqueTargetIncludes.] => field: string
# OUTPUTS:
# - [boolean] - [Возвращаемое значение операции uniqueTargetIncludes.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция uniqueTargetIncludes завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу boolean.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): isArray; CALLS(7): includes]
# END_CONTRACT
*/
function uniqueTargetIncludes(err: Prisma.PrismaClientKnownRequestError, field: string): boolean {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
  // END_BLOCK_MAIN
}
// END_FUNCTION_uniqueTargetIncludes
