/*
# FILE: apps/api/src/points/points-awards.service.ts
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
# CLASS 9 [Основной класс модуля.] => PointsAwardsService
# METHOD 7 [Метод класса PointsAwardsService.] => constructor
# METHOD 7 [Метод класса PointsAwardsService.] => awardSignupBonus
# METHOD 7 [Метод класса PointsAwardsService.] => awardEventAttendance
# METHOD 7 [Метод класса PointsAwardsService.] => amountForEvent
# FUNC 7 [Функция уровня модуля.] => reasonTypeForEvent
# END_MODULE_MAP
# START_USE_CASES:
#- [PointsAwardsService.awardSignupBonus]: Application Service (Business Flow) -> ExecuteAwardSignupBonus -> BusinessResultPrepared
#- [PointsAwardsService.awardEventAttendance]: Application Service (Business Flow) -> ExecuteAwardEventAttendance -> BusinessResultPrepared
#- [reasonTypeForEvent]: Application Service (Business Flow) -> ExecuteReasonTypeForEvent -> ResultPrepared
# END_USE_CASES
*/

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  Event,
  EventAttendance,
  EventType,
  PointActorType,
  PointDirection,
  PointReasonType,
  PointTransaction,
  Prisma,
} from "@prisma/client";
import type { Env } from "../config/env.schema";
import { PointsService } from "./points.service";

// START_CLASS_PointsAwardsService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена points.
# ATTRIBUTES:
# - [Атрибут класса PointsAwardsService.] => logger: unknown
# - [Атрибут класса PointsAwardsService.] => points: PointsService
# - [Атрибут класса PointsAwardsService.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене points.] => constructor()
# - [Выполняет операцию awardSignupBonus в домене points.] => awardSignupBonus()
# - [Выполняет операцию awardEventAttendance в домене points.] => awardEventAttendance()
# - [Выполняет операцию amountForEvent в домене points.] => amountForEvent()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class PointsAwardsService {
  private readonly logger = new Logger(PointsAwardsService.name);

  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly points: PointsService,
    private readonly config: ConfigService<Env, true>,
  ) {}
  // END_METHOD_constructor


  /** Welcome bonus. Idempotent per user via `signup_bonus:<userId>`. */
  
  // START_METHOD_awardSignupBonus
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию awardSignupBonus в домене points.
  # INPUTS:
  # - [Входной параметр awardSignupBonus.] => userId: string
  # - [Входной параметр awardSignupBonus.] => tx?: Prisma.TransactionClient
  # OUTPUTS:
  # - [Promise<PointTransaction | null>] - [Возвращаемое значение операции awardSignupBonus.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция awardSignupBonus завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<PointTransaction | null>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): config.get; CALLS(7): points.post; CALLS(7): get; CALLS(7): post]
  # END_CONTRACT
  */
  async awardSignupBonus(userId: string, tx?: Prisma.TransactionClient): Promise<PointTransaction | null> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const amount = this.config.get("WELCOME_BONUS_POINTS", { infer: true });
    if (amount <= 0) return null;
    return this.points.post(
      {
        userId,
        direction: PointDirection.credit,
        amount,
        reasonType: PointReasonType.signup_bonus,
        idempotencyKey: `signup_bonus:${userId}`,
        actor: { type: PointActorType.system },
        comment: "Welcome to CityRNNG",
      },
      tx,
    );
    // END_BLOCK_MAIN
  }
  // END_METHOD_awardSignupBonus


  /**
   * Event attendance award. Idempotent per attendance via
   * `event_attendance:<attendanceId>`. No-op (returns null) when the event is
   * not points-eligible, the computed amount is 0, or the event type is not
   * awardable in this PR (partner).
   */
  
  // START_METHOD_awardEventAttendance
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию awardEventAttendance в домене points.
  # INPUTS:
  # - [Входной параметр awardEventAttendance.] => attendance: EventAttendance
  # - [Входной параметр awardEventAttendance.] => event: Event
  # - [Входной параметр awardEventAttendance.] => tx?: Prisma.TransactionClient
  # OUTPUTS:
  # - [Promise<PointTransaction | null>] - [Возвращаемое значение операции awardEventAttendance.]
  # SIDE_EFFECTS:
  # - Записывает диагностические сообщения в лог.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция awardEventAttendance завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<PointTransaction | null>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): logger.log; CALLS(7): points.post; CALLS(7): Error; CALLS(7): reasonTypeForEvent]
  # END_CONTRACT
  */
  async awardEventAttendance(
    attendance: EventAttendance,
    event: Event,
    tx?: Prisma.TransactionClient,
  ): Promise<PointTransaction | null> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    if (!event.isPointsEligible) return null;
    if (attendance.eventId !== event.id) {
      throw new Error("awardEventAttendance: attendance/event mismatch");
    }
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_PROCESS_COLLECTION: [Обрабатывает коллекции и агрегирует промежуточный результат.]
    const reasonType = reasonTypeForEvent(event.type);
    if (!reasonType) {
      this.logger.log(
        `Event attendance award skipped for event type=${event.type} (not yet awardable)`,
      );
      return null;
    }
    // END_BLOCK_PROCESS_COLLECTION

    // START_BLOCK_VALIDATE_CONDITIONS_02: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const amount = this.amountForEvent(event);
    if (amount <= 0) return null;
    // END_BLOCK_VALIDATE_CONDITIONS_02

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return this.points.post(
      {
        userId: attendance.userId,
        direction: PointDirection.credit,
        amount,
        reasonType,
        reasonRef: attendance.id,
        idempotencyKey: `event_attendance:${attendance.id}`,
        actor: { type: PointActorType.system },
      },
      tx,
    );
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_awardEventAttendance


  
  // START_METHOD_amountForEvent
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию amountForEvent в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private amountForEvent(event: Event): number {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    if (event.basePointsAward > 0) return event.basePointsAward;
    if (event.type === EventType.regular) {
      return this.config.get("EVENT_ATTENDANCE_REGULAR_POINTS_FALLBACK", { infer: true });
    }
    if (event.type === EventType.special) {
      return this.config.get("EVENT_ATTENDANCE_SPECIAL_POINTS_FALLBACK", { infer: true });
    }
    return 0;
    // END_BLOCK_MAIN
  }
  // END_METHOD_amountForEvent

}
// END_CLASS_PointsAwardsService


/** Partner deferred: enum value exists (event_attendance_partner) but not awarded in this PR. */

// START_FUNCTION_reasonTypeForEvent
/*
# START_CONTRACT:
# PURPOSE: Выполняет операцию reasonTypeForEvent в домене points.
# INPUTS:
# - [Входной параметр reasonTypeForEvent.] => type: EventType
# OUTPUTS:
# - [PointReasonType | null] - [Возвращаемое значение операции reasonTypeForEvent.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция reasonTypeForEvent завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу PointReasonType | null.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Service; TYPE(6): Function]
# END_CONTRACT
*/
function reasonTypeForEvent(type: EventType): PointReasonType | null {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  switch (type) {
    case EventType.regular:
      return PointReasonType.event_attendance_regular;
    case EventType.special:
      return PointReasonType.event_attendance_special;
    case EventType.partner:
      return null;
    default:
      return null;
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_reasonTypeForEvent
