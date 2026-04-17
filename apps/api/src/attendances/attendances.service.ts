/*
# FILE: apps/api/src/attendances/attendances.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена attendances.
# SCOPE: Service layer for domain attendances inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AttendancesService
# METHOD 7 [Метод класса AttendancesService.] => constructor
# METHOD 7 [Метод класса AttendancesService.] => listForEvent
# METHOD 7 [Метод класса AttendancesService.] => approve
# METHOD 7 [Метод класса AttendancesService.] => reject
# END_MODULE_MAP
# START_USE_CASES:
#- [AttendancesService.listForEvent]: Application Service (Business Flow) -> ExecuteListForEvent -> BusinessResultPrepared
#- [AttendancesService.approve]: Application Service (Business Flow) -> ExecuteApprove -> BusinessResultPrepared
#- [AttendancesService.reject]: Application Service (Business Flow) -> ExecuteReject -> BusinessResultPrepared
# END_USE_CASES
*/

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { AttendanceStatus } from "@prisma/client";
import { PointsAwardsService } from "../points/points-awards.service";
import { PrismaService } from "../prisma/prisma.service";

// START_CLASS_AttendancesService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена attendances.
# ATTRIBUTES:
# - [Атрибут класса AttendancesService.] => prisma: PrismaService
# - [Атрибут класса AttendancesService.] => pointsAwards: PointsAwardsService
# METHODS:
# - [Выполняет операцию constructor в домене attendances.] => constructor()
# - [Возвращает список сущностей или записей домена attendances.] => listForEvent()
# - [Подтверждает действие или сущность в домене attendances.] => approve()
# - [Отклоняет действие или сущность в домене attendances.] => reject()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class AttendancesService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене attendances.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsAwards: PointsAwardsService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_listForEvent
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена attendances.
  # INPUTS:
  # - [Входной параметр listForEvent.] => eventId: string
  # - [Входной параметр listForEvent.] => status?: AttendanceStatus
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция listForEvent завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.findUnique; CALLS(7): prisma.eventAttendance.findMany; CALLS(7): findUnique; CALLS(7): NotFoundException]
  # END_CONTRACT
  */
  async listForEvent(eventId: string, status?: AttendanceStatus) {
    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException({ code: "EVENT_NOT_FOUND" });
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return this.prisma.eventAttendance.findMany({
      where: { eventId, status: status ?? undefined },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true } },
        externalActivity: true,
      },
    });
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_listForEvent


  
  // START_METHOD_approve
  /*
  # START_CONTRACT:
  # PURPOSE: Подтверждает действие или сущность в домене attendances.
  # INPUTS:
  # - [Входной параметр approve.] => id: string
  # - [Входной параметр approve.] => reviewerId: string
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция approve завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.$transaction; CALLS(7): pointsAwards.awardEventAttendance; CALLS(7): transaction; CALLS(7): async]
  # END_CONTRACT
  */
  async approve(id: string, reviewerId: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.eventAttendance.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException({ code: "ATTENDANCE_NOT_FOUND" });
      if (existing.status !== AttendanceStatus.pending) {
        throw new ConflictException({ code: "ATTENDANCE_ALREADY_REVIEWED" });
      }
      const updated = await tx.eventAttendance.update({
        where: { id },
        data: {
          status: AttendanceStatus.approved,
          reviewedAt: new Date(),
          reviewedById: reviewerId,
          rejectionReason: null,
        },
      });
      const event = await tx.event.findUniqueOrThrow({ where: { id: updated.eventId } });
      await this.pointsAwards.awardEventAttendance(updated, event, tx);
      return updated;
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_approve


  
  // START_METHOD_reject
  /*
  # START_CONTRACT:
  # PURPOSE: Отклоняет действие или сущность в домене attendances.
  # INPUTS:
  # - [Входной параметр reject.] => id: string
  # - [Входной параметр reject.] => reviewerId: string
  # - [Входной параметр reject.] => reason?: string
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция reject завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.eventAttendance.findUnique; CALLS(7): prisma.eventAttendance.update; CALLS(7): findUnique; CALLS(7): NotFoundException]
  # END_CONTRACT
  */
  async reject(id: string, reviewerId: string, reason?: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const existing = await this.prisma.eventAttendance.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: "ATTENDANCE_NOT_FOUND" });
    if (existing.status !== AttendanceStatus.pending) {
      throw new ConflictException({ code: "ATTENDANCE_ALREADY_REVIEWED" });
    }
    return this.prisma.eventAttendance.update({
      where: { id },
      data: {
        status: AttendanceStatus.rejected,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        rejectionReason: reason ?? null,
      },
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_reject

}
// END_CLASS_AttendancesService
