/*
# FILE: apps/api/src/attendances/attendance-matcher.service.ts
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
# CLASS 9 [Основной класс модуля.] => AttendanceMatcherService
# METHOD 7 [Метод класса AttendanceMatcherService.] => constructor
# METHOD 7 [Метод класса AttendanceMatcherService.] => matchForUser
# METHOD 7 [Метод класса AttendanceMatcherService.] => createAttendanceAndAward
# METHOD 7 [Метод класса AttendanceMatcherService.] => ruleMatchesActivity
# FUNC 7 [Функция уровня модуля.] => activityPoints
# FUNC 7 [Функция уровня модуля.] => passesLocations
# FUNC 7 [Функция уровня модуля.] => passesLegacyGeofence
# FUNC 7 [Функция уровня модуля.] => haversineMeters
# FUNC 7 [Функция уровня модуля.] => uniqueTargetIncludes
# TYPE 5 [Тип или интерфейс прикладного контракта.] => MatchOptions
# TYPE 5 [Тип или интерфейс прикладного контракта.] => MatchSummary
# TYPE 5 [Тип или интерфейс прикладного контракта.] => SyncRuleWithContext
# CONST 4 [Константа или конфигурационное значение модуля.] => DEFAULT_LOCATION_RADIUS_METERS
# END_MODULE_MAP
# START_USE_CASES:
#- [AttendanceMatcherService.matchForUser]: Application Service (Business Flow) -> ExecuteMatchForUser -> BusinessResultPrepared
#- [AttendanceMatcherService.ruleMatchesActivity]: Application Service (Business Flow) -> ExecuteRuleMatchesActivity -> BusinessResultPrepared
#- [activityPoints]: Application Service (Business Flow) -> ExecuteActivityPoints -> ResultPrepared
#- [passesLocations]: Application Service (Business Flow) -> ExecutePassesLocations -> ResultPrepared
#- [passesLegacyGeofence]: Application Service (Business Flow) -> ExecutePassesLegacyGeofence -> ResultPrepared
#- [haversineMeters]: Application Service (Business Flow) -> ExecuteHaversineMeters -> ResultPrepared
#- [uniqueTargetIncludes]: Application Service (Business Flow) -> ExecuteUniqueTargetIncludes -> ResultPrepared
# END_USE_CASES
*/

import { Injectable, Logger } from "@nestjs/common";
import {
  AttendanceSource,
  AttendanceStatus,
  CityLocation,
  CityLocationStatus,
  Event,
  EventSyncRule,
  ExternalActivity,
  Prisma,
  SyncProvider,
} from "@prisma/client";
import { PointsAwardsService } from "../points/points-awards.service";
import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_LOCATION_RADIUS_METERS = 500;

type SyncRuleWithContext = EventSyncRule & {
  event: Event;
  locations: Array<{ location: CityLocation }>;
};

export interface MatchOptions {
  after?: Date;
  before?: Date;
}

export interface MatchSummary {
  activitiesEvaluated: number;
  rulesConsidered: number;
  candidatesAttempted: number;
  attendancesCreated: number;
  awardsPosted: number;
}

// START_CLASS_AttendanceMatcherService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена attendances.
# ATTRIBUTES:
# - [Атрибут класса AttendanceMatcherService.] => logger: unknown
# - [Атрибут класса AttendanceMatcherService.] => prisma: PrismaService
# - [Атрибут класса AttendanceMatcherService.] => pointsAwards: PointsAwardsService
# METHODS:
# - [Выполняет операцию constructor в домене attendances.] => constructor()
# - [Сопоставляет внешние активности пользователя с правилами событий.] => matchForUser()
# - [Создает attendance и, при необходимости, начисляет баллы за участие.] => createAttendanceAndAward()
# - [Проверяет, соответствует ли активность окну и ограничениям правила синхронизации.] => ruleMatchesActivity()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class AttendanceMatcherService {
  private readonly logger = new Logger(AttendanceMatcherService.name);

  
  
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
  ) {  }
  // END_METHOD_constructor


  
  
  // START_METHOD_matchForUser
  /*
  # START_CONTRACT:
  # PURPOSE: Сопоставляет внешние активности пользователя с правилами событий.
  # INPUTS:
  # - [Входной параметр matchForUser.] => userId: string
  # - [Входной параметр matchForUser.] => options: MatchOptions
  # OUTPUTS:
  # - [Promise<MatchSummary>] - [Возвращаемое значение операции matchForUser.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция matchForUser завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<MatchSummary>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.externalActivity.findMany; CALLS(7): prisma.eventSyncRule.findMany; CALLS(7): findMany; CALLS(7): ruleMatchesActivity]
  # END_CONTRACT
  */
  async matchForUser(userId: string, options: MatchOptions = {}): Promise<MatchSummary> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const activityWhere: Prisma.ExternalActivityWhereInput = {
      userId,
      provider: SyncProvider.strava,
    };
    if (options.after || options.before) {
      activityWhere.startedAt = {};
      if (options.after) activityWhere.startedAt.gte = options.after;
      if (options.before) activityWhere.startedAt.lte = options.before;
    }
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    const activities = await this.prisma.externalActivity.findMany({
      where: activityWhere,
      orderBy: [{ startedAt: "asc" }, { id: "asc" }],
    });
    if (activities.length === 0) {
      return {
        activitiesEvaluated: 0,
        rulesConsidered: 0,
        candidatesAttempted: 0,
        attendancesCreated: 0,
        awardsPosted: 0,
      };
    }
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const minStart = activities[0]!.startedAt;
    const maxStart = activities[activities.length - 1]!.startedAt;
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_ACCESS_DATA_STORE_02: [Выполняет операции чтения или записи в хранилище данных.]
    const rules = (await this.prisma.eventSyncRule.findMany({
      where: {
        provider: SyncProvider.strava,
        windowEndsAt: { gte: minStart },
        windowStartsAt: { lte: maxStart },
      },
      orderBy: [{ windowStartsAt: "asc" }, { eventId: "asc" }],
      include: {
        event: true,
        locations: {
          where: { location: { status: CityLocationStatus.active } },
          include: { location: true },
        },
      },
    })) as SyncRuleWithContext[];
    // END_BLOCK_ACCESS_DATA_STORE_02

    // START_BLOCK_EXECUTE_MAIN_FLOW_02: [Исполняет основную бизнес-логику блока.]
    let candidatesAttempted = 0;
    let attendancesCreated = 0;
    let awardsPosted = 0;
    // END_BLOCK_EXECUTE_MAIN_FLOW_02

    // START_BLOCK_PROCESS_COLLECTION: [Обрабатывает коллекции и агрегирует промежуточный результат.]
    for (const activity of activities) {
      for (const rule of rules) {
        if (!this.ruleMatchesActivity(rule, activity)) continue;
        candidatesAttempted += 1;

        const outcome = await this.createAttendanceAndAward(userId, activity, rule);
        if (outcome.created) attendancesCreated += 1;
        if (outcome.awarded) awardsPosted += 1;
      }
    }
    // END_BLOCK_PROCESS_COLLECTION

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return {
      activitiesEvaluated: activities.length,
      rulesConsidered: rules.length,
      candidatesAttempted,
      attendancesCreated,
      awardsPosted,
    };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_matchForUser


  
  
  // START_METHOD_createAttendanceAndAward
  /*
  # START_CONTRACT:
  # PURPOSE: Создает attendance и, при необходимости, начисляет баллы за участие.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private async createAttendanceAndAward(
    userId: string,
    activity: ExternalActivity,
    rule: SyncRuleWithContext,
  ): Promise<{ created: boolean; awarded: boolean }> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    try {
      return await this.prisma.$transaction(async (tx) => {
        const status = rule.autoApprove ? AttendanceStatus.approved : AttendanceStatus.pending;
        const now = new Date();
        const attendance = await tx.eventAttendance.create({
          data: {
            eventId: rule.eventId,
            userId,
            externalActivityId: activity.id,
            source: AttendanceSource.sync,
            status,
            matchedAt: now,
            reviewedAt: rule.autoApprove ? now : null,
          },
        });

        let awarded = false;
        if (rule.autoApprove) {
          const award = await this.pointsAwards.awardEventAttendance(attendance, rule.event, tx);
          if (award) awarded = true;
        }
        return { created: true, awarded };
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        uniqueTargetIncludes(err, "event_id") &&
        uniqueTargetIncludes(err, "user_id")
      ) {
        // Another attendance already exists for this (event, user) — preserve it, no duplicate.
        return { created: false, awarded: false };
      }
      this.logger.error(
        `Attendance insert failed for user=${userId} event=${rule.eventId} activity=${activity.id}: ${(err as Error).message}`,
      );
      throw err;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_createAttendanceAndAward


  
  
  // START_METHOD_ruleMatchesActivity
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет, соответствует ли активность окну и ограничениям правила синхронизации.
  # INPUTS:
  # - [Входной параметр ruleMatchesActivity.] => rule: SyncRuleWithContext
  # - [Входной параметр ruleMatchesActivity.] => activity: ExternalActivity
  # OUTPUTS:
  # - [boolean] - [Возвращаемое значение операции ruleMatchesActivity.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция ruleMatchesActivity завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу boolean.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): getTime; CALLS(7): toLowerCase; CALLS(7): map; CALLS(7): passesLocations]
  # END_CONTRACT
  */
  ruleMatchesActivity(rule: SyncRuleWithContext, activity: ExternalActivity): boolean {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const activityEnd = new Date(activity.startedAt.getTime() + activity.elapsedSeconds * 1000);
    if (activity.startedAt < rule.windowStartsAt) return false;
    if (activityEnd > rule.windowEndsAt) return false;
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_VALIDATE_CONDITIONS_02: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    if (rule.activityType) {
      const expected = rule.activityType.toLowerCase();
      const actual = (activity.activityType ?? "").toLowerCase();
      if (expected !== actual) return false;
    }
    // END_BLOCK_VALIDATE_CONDITIONS_02

    // START_BLOCK_VALIDATE_CONDITIONS_03: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    if (rule.minDistanceMeters != null && activity.distanceMeters < rule.minDistanceMeters) return false;
    if (rule.maxDistanceMeters != null && activity.distanceMeters > rule.maxDistanceMeters) return false;
    // END_BLOCK_VALIDATE_CONDITIONS_03

    // START_BLOCK_VALIDATE_CONDITIONS_04: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    if (rule.minDurationSeconds != null && activity.elapsedSeconds < rule.minDurationSeconds) return false;
    if (rule.maxDurationSeconds != null && activity.elapsedSeconds > rule.maxDurationSeconds) return false;
    // END_BLOCK_VALIDATE_CONDITIONS_04

    // START_BLOCK_PROCESS_COLLECTION: [Обрабатывает коллекции и агрегирует промежуточный результат.]
    const activeLocations = rule.locations.map((l) => l.location);
    if (activeLocations.length > 0) {
      if (!passesLocations(activeLocations, activity)) return false;
    } else if (
      rule.geofenceLat != null &&
      rule.geofenceLng != null &&
      rule.geofenceRadiusMeters != null
    ) {
      if (!passesLegacyGeofence(rule, activity)) return false;
    }
    // END_BLOCK_PROCESS_COLLECTION

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return true;
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_ruleMatchesActivity


}
// END_CLASS_AttendanceMatcherService


// START_FUNCTION_activityPoints
/*
# START_CONTRACT:
# PURPOSE: Извлекает координаты старта и финиша активности для геосопоставления.
# INPUTS:
# - [Входной параметр activityPoints.] => activity: ExternalActivity
# OUTPUTS:
# - [Array<[number, number]>] - [Возвращаемое значение операции activityPoints.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция activityPoints завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу Array<[number, number]>.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): push]
# END_CONTRACT
*/
function activityPoints(activity: ExternalActivity): Array<[number, number]> {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const points: Array<[number, number]> = [];
  if (activity.startLat != null && activity.startLng != null) {
    points.push([activity.startLat, activity.startLng]);
  }
  if (activity.endLat != null && activity.endLng != null) {
    points.push([activity.endLat, activity.endLng]);
  }
  return points;
  // END_BLOCK_MAIN
}
// END_FUNCTION_activityPoints


// START_FUNCTION_passesLocations
/*
# START_CONTRACT:
# PURPOSE: Проверяет попадание активности в активные городские локации события.
# INPUTS:
# - [Входной параметр passesLocations.] => locations: CityLocation[]
# - [Входной параметр passesLocations.] => activity: ExternalActivity
# OUTPUTS:
# - [boolean] - [Возвращаемое значение операции passesLocations.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция passesLocations завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу boolean.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): activityPoints; CALLS(7): some; CALLS(7): haversineMeters]
# END_CONTRACT
*/
function passesLocations(locations: CityLocation[], activity: ExternalActivity): boolean {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const points = activityPoints(activity);
  if (points.length === 0) return false;
  return locations.some((loc) => {
    const radius = loc.radiusMeters ?? DEFAULT_LOCATION_RADIUS_METERS;
    return points.some(([lat, lng]) => haversineMeters(loc.lat, loc.lng, lat, lng) <= radius);
  });
  // END_BLOCK_MAIN
}
// END_FUNCTION_passesLocations


// START_FUNCTION_passesLegacyGeofence
/*
# START_CONTRACT:
# PURPOSE: Проверяет активность по legacy geofence-правилу события.
# INPUTS:
# - [Входной параметр passesLegacyGeofence.] => rule: EventSyncRule
# - [Входной параметр passesLegacyGeofence.] => activity: ExternalActivity
# OUTPUTS:
# - [boolean] - [Возвращаемое значение операции passesLegacyGeofence.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция passesLegacyGeofence завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу boolean.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): activityPoints; CALLS(7): some; CALLS(7): haversineMeters]
# END_CONTRACT
*/
function passesLegacyGeofence(rule: EventSyncRule, activity: ExternalActivity): boolean {
  // START_BLOCK_PREPARE_CONTEXT: [Подготавливает исходные данные и локальный контекст выполнения.]
  const lat = rule.geofenceLat!;
  const lng = rule.geofenceLng!;
  const radius = rule.geofenceRadiusMeters!;
  // END_BLOCK_PREPARE_CONTEXT

  // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
  const points = activityPoints(activity);
  if (points.length === 0) return false;
  // END_BLOCK_VALIDATE_CONDITIONS

  // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
  return points.some(([plat, plng]) => haversineMeters(lat, lng, plat, plng) <= radius);
  // END_BLOCK_PREPARE_RESULT
}
// END_FUNCTION_passesLegacyGeofence


// START_FUNCTION_haversineMeters
/*
# START_CONTRACT:
# PURPOSE: Вычисляет расстояние между двумя координатами в метрах.
# INPUTS:
# - [Входной параметр haversineMeters.] => lat1: number
# - [Входной параметр haversineMeters.] => lng1: number
# - [Входной параметр haversineMeters.] => lat2: number
# - [Входной параметр haversineMeters.] => lng2: number
# OUTPUTS:
# - [number] - [Возвращаемое значение операции haversineMeters.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция haversineMeters завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу number.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): toRad; CALLS(7): sin; CALLS(7): cos; CALLS(7): asin]
# END_CONTRACT
*/
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  // END_BLOCK_MAIN
}
// END_FUNCTION_haversineMeters


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
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): isArray; CALLS(7): includes]
# END_CONTRACT
*/
function uniqueTargetIncludes(
  err: Prisma.PrismaClientKnownRequestError,
  field: string,
): boolean {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
  // END_BLOCK_MAIN
}
// END_FUNCTION_uniqueTargetIncludes
