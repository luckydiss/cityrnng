/*
# FILE: apps/api/src/events/sync-rules.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена events.
# SCOPE: Service layer for domain events inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => SyncRulesService
# METHOD 7 [Метод класса SyncRulesService.] => constructor
# METHOD 7 [Метод класса SyncRulesService.] => upsertForEvent
# FUNC 7 [Функция уровня модуля.] => assertOptionalRange
# FUNC 7 [Функция уровня модуля.] => assertGeofence
# END_MODULE_MAP
# START_USE_CASES:
#- [SyncRulesService.upsertForEvent]: Application Service (Business Flow) -> ExecuteUpsertForEvent -> BusinessResultPrepared
#- [assertOptionalRange]: Application Service (Business Flow) -> ExecuteAssertOptionalRange -> ResultPrepared
#- [assertGeofence]: Application Service (Business Flow) -> ExecuteAssertGeofence -> ResultPrepared
# END_USE_CASES
*/

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CityLocationStatus, SyncProvider } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertSyncRuleDto } from "./dto/upsert-sync-rule.dto";

// START_CLASS_SyncRulesService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена events.
# ATTRIBUTES:
# - [Атрибут класса SyncRulesService.] => prisma: PrismaService) {}
# METHODS:
# - [Выполняет операцию constructor в домене events.] => constructor()
# - [Обновляет состояние или данные домена events.] => upsertForEvent()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class SyncRulesService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly prisma: PrismaService) {}
  // END_METHOD_constructor


  
  // START_METHOD_upsertForEvent
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена events.
  # INPUTS:
  # - [Входной параметр upsertForEvent.] => eventId: string
  # - [Входной параметр upsertForEvent.] => dto: UpsertSyncRuleDto
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция upsertForEvent завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.findUnique; CALLS(7): prisma.cityLocation.findMany; CALLS(7): prisma.$transaction; CALLS(7): findUnique]
  # END_CONTRACT
  */
  async upsertForEvent(eventId: string, dto: UpsertSyncRuleDto) {
    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException({ code: "EVENT_NOT_FOUND" });
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const windowStartsAt = new Date(dto.windowStartsAt);
    const windowEndsAt = new Date(dto.windowEndsAt);
    if (windowStartsAt.getTime() >= windowEndsAt.getTime()) {
      throw new BadRequestException({ code: "SYNC_RULE_INVALID_WINDOW" });
    }
    assertOptionalRange(dto.minDistanceMeters, dto.maxDistanceMeters, "DISTANCE");
    assertOptionalRange(dto.minDurationSeconds, dto.maxDurationSeconds, "DURATION");
    assertGeofence(dto);
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_ACCESS_DATA_STORE_02: [Выполняет операции чтения или записи в хранилище данных.]
    const locationIds = dto.locationIds ?? [];
    if (locationIds.length > 0) {
      const found = await this.prisma.cityLocation.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, status: true },
      });
      if (found.length !== locationIds.length) {
        throw new BadRequestException({ code: "SYNC_RULE_LOCATION_NOT_FOUND" });
      }
      const archived = found.filter((l) => l.status !== CityLocationStatus.active);
      if (archived.length > 0) {
        throw new BadRequestException({ code: "SYNC_RULE_LOCATION_ARCHIVED" });
      }
    }
    // END_BLOCK_ACCESS_DATA_STORE_02

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const data = {
      provider: dto.provider ?? SyncProvider.strava,
      activityType: dto.activityType ?? null,
      minDistanceMeters: dto.minDistanceMeters ?? null,
      maxDistanceMeters: dto.maxDistanceMeters ?? null,
      minDurationSeconds: dto.minDurationSeconds ?? null,
      maxDurationSeconds: dto.maxDurationSeconds ?? null,
      windowStartsAt,
      windowEndsAt,
      geofenceLat: dto.geofenceLat ?? null,
      geofenceLng: dto.geofenceLng ?? null,
      geofenceRadiusMeters: dto.geofenceRadiusMeters ?? null,
      autoApprove: dto.autoApprove ?? false,
    };
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return this.prisma.$transaction(async (tx) => {
      const rule = await tx.eventSyncRule.upsert({
        where: { eventId },
        create: { eventId, ...data },
        update: data,
      });

      if (dto.locationIds !== undefined) {
        await tx.eventSyncRuleLocation.deleteMany({ where: { syncRuleId: rule.id } });
        if (locationIds.length > 0) {
          await tx.eventSyncRuleLocation.createMany({
            data: locationIds.map((locationId) => ({ syncRuleId: rule.id, locationId })),
          });
        }
      }

      return tx.eventSyncRule.findUniqueOrThrow({
        where: { id: rule.id },
        include: { locations: { include: { location: true } } },
      });
    });
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_upsertForEvent

}
// END_CLASS_SyncRulesService


// START_FUNCTION_assertOptionalRange
/*
# START_CONTRACT:
# PURPOSE: Проверяет условия и ограничения, связанные с доменом events.
# INPUTS:
# - [Входной параметр assertOptionalRange.] => min: number | undefined
# - [Входной параметр assertOptionalRange.] => max: number | undefined
# - [Входной параметр assertOptionalRange.] => label: string
# SIDE_EFFECTS:
# - Может завершиться исключением при нарушении условий выполнения.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция assertOptionalRange завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): BadRequestException]
# END_CONTRACT
*/
function assertOptionalRange(min: number | undefined, max: number | undefined, label: string) {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  if (min != null && max != null && min > max) {
    throw new BadRequestException({ code: `SYNC_RULE_INVALID_${label}_RANGE` });
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_assertOptionalRange


// START_FUNCTION_assertGeofence
/*
# START_CONTRACT:
# PURPOSE: Проверяет условия и ограничения, связанные с доменом events.
# INPUTS:
# - [Входной параметр assertGeofence.] => dto: UpsertSyncRuleDto
# SIDE_EFFECTS:
# - Может завершиться исключением при нарушении условий выполнения.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция assertGeofence завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): filter; CALLS(7): BadRequestException]
# END_CONTRACT
*/
function assertGeofence(dto: UpsertSyncRuleDto) {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const provided = [dto.geofenceLat, dto.geofenceLng, dto.geofenceRadiusMeters].filter(
    (v) => v != null,
  ).length;
  if (provided > 0 && provided !== 3) {
    throw new BadRequestException({ code: "SYNC_RULE_INCOMPLETE_GEOFENCE" });
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_assertGeofence
