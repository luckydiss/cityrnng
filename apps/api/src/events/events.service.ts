/*
# FILE: apps/api/src/events/events.service.ts
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
# CLASS 9 [Основной класс модуля.] => EventsService
# METHOD 7 [Метод класса EventsService.] => constructor
# METHOD 7 [Метод класса EventsService.] => listPublic
# METHOD 7 [Метод класса EventsService.] => getByIdOrThrow
# METHOD 7 [Метод класса EventsService.] => getAdminByIdOrThrow
# METHOD 7 [Метод класса EventsService.] => create
# METHOD 7 [Метод класса EventsService.] => update
# FUNC 7 [Функция уровня модуля.] => assertDateRange
# FUNC 7 [Функция уровня модуля.] => isUniqueViolation
# FUNC 7 [Функция уровня модуля.] => mapEventPublic
# TYPE 5 [Тип или интерфейс прикладного контракта.] => EventWithPublicSyncRule
# CONST 4 [Константа или конфигурационное значение модуля.] => publicSyncRuleInclude
# END_MODULE_MAP
# START_USE_CASES:
#- [EventsService.listPublic]: Application Service (Business Flow) -> ExecuteListPublic -> BusinessResultPrepared
#- [EventsService.getByIdOrThrow]: Application Service (Business Flow) -> ExecuteGetByIdOrThrow -> BusinessResultPrepared
#- [EventsService.getAdminByIdOrThrow]: Application Service (Business Flow) -> ExecuteGetAdminByIdOrThrow -> BusinessResultPrepared
#- [EventsService.create]: Application Service (Business Flow) -> ExecuteCreate -> BusinessResultPrepared
#- [EventsService.update]: Application Service (Business Flow) -> ExecuteUpdate -> BusinessResultPrepared
#- [assertDateRange]: Application Service (Business Flow) -> ExecuteAssertDateRange -> ResultPrepared
#- [isUniqueViolation]: Application Service (Business Flow) -> ExecuteIsUniqueViolation -> ResultPrepared
#- [mapEventPublic]: Application Service (Business Flow) -> ExecuteMapEventPublic -> ResultPrepared
# END_USE_CASES
*/

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CityLocationStatus, EventStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { ListEventsQuery } from "./dto/list-events.query";

// START_CLASS_EventsService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена events.
# ATTRIBUTES:
# - [Атрибут класса EventsService.] => prisma: PrismaService) {}
# METHODS:
# - [Выполняет операцию constructor в домене events.] => constructor()
# - [Возвращает список сущностей или записей домена events.] => listPublic()
# - [Получает данные домена events по заданным условиям.] => getByIdOrThrow()
# - [Получает данные домена events по заданным условиям.] => getAdminByIdOrThrow()
# - [Создает новую сущность или запись домена events.] => create()
# - [Обновляет состояние или данные домена events.] => update()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class EventsService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly prisma: PrismaService) {}
  // END_METHOD_constructor


  
  // START_METHOD_listPublic
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена events.
  # INPUTS:
  # - [Входной параметр listPublic.] => query: ListEventsQuery
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция listPublic завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.findMany; CALLS(7): findMany; CALLS(7): map]
  # END_CONTRACT
  */
  async listPublic(query: ListEventsQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const where: Prisma.EventWhereInput = {};
    where.status = query.status ?? EventStatus.published;
    if (query.type) where.type = query.type;
    if (query.from || query.to) {
      where.startsAt = {};
      if (query.from) where.startsAt.gte = new Date(query.from);
      if (query.to) where.startsAt.lte = new Date(query.to);
    }
    const rows = await this.prisma.event.findMany({
      where,
      orderBy: { startsAt: "asc" },
      include: { syncRule: { include: publicSyncRuleInclude.include } },
    });
    return rows.map(mapEventPublic);
    // END_BLOCK_MAIN
  }
  // END_METHOD_listPublic


  
  // START_METHOD_getByIdOrThrow
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена events по заданным условиям.
  # INPUTS:
  # - [Входной параметр getByIdOrThrow.] => id: string
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция getByIdOrThrow завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.findUnique; CALLS(7): findUnique; CALLS(7): NotFoundException; CALLS(7): mapEventPublic]
  # END_CONTRACT
  */
  async getByIdOrThrow(id: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { syncRule: { include: publicSyncRuleInclude.include } },
    });
    if (!event) throw new NotFoundException({ code: "EVENT_NOT_FOUND" });
    return mapEventPublic(event);
    // END_BLOCK_MAIN
  }
  // END_METHOD_getByIdOrThrow


  
  // START_METHOD_getAdminByIdOrThrow
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена events по заданным условиям.
  # INPUTS:
  # - [Входной параметр getAdminByIdOrThrow.] => id: string
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция getAdminByIdOrThrow завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.findUnique; CALLS(7): findUnique; CALLS(7): NotFoundException]
  # END_CONTRACT
  */
  async getAdminByIdOrThrow(id: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException({ code: "EVENT_NOT_FOUND" });
    return event;
    // END_BLOCK_MAIN
  }
  // END_METHOD_getAdminByIdOrThrow


  
  // START_METHOD_create
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новую сущность или запись домена events.
  # INPUTS:
  # - [Входной параметр create.] => dto: CreateEventDto
  # - [Входной параметр create.] => createdById: string
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция create завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.create; CALLS(7): assertDateRange; CALLS(7): create; CALLS(7): isUniqueViolation]
  # END_CONTRACT
  */
  async create(dto: CreateEventDto, createdById: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    assertDateRange(dto.startsAt, dto.endsAt);
    try {
      return await this.prisma.event.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          type: dto.type,
          status: dto.status,
          startsAt: new Date(dto.startsAt),
          endsAt: new Date(dto.endsAt),
          locationName: dto.locationName,
          locationAddress: dto.locationAddress,
          locationLat: dto.locationLat,
          locationLng: dto.locationLng,
          capacity: dto.capacity,
          registrationOpenAt: dto.registrationOpenAt
            ? new Date(dto.registrationOpenAt)
            : null,
          registrationCloseAt: dto.registrationCloseAt
            ? new Date(dto.registrationCloseAt)
            : null,
          isPointsEligible: dto.isPointsEligible ?? false,
          basePointsAward: dto.basePointsAward ?? 0,
          createdById,
        },
      });
    } catch (err) {
      if (isUniqueViolation(err, "slug")) {
        throw new ConflictException({ code: "EVENT_SLUG_TAKEN" });
      }
      throw err;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_create


  
  // START_METHOD_update
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена events.
  # INPUTS:
  # - [Входной параметр update.] => id: string
  # - [Входной параметр update.] => dto: UpdateEventDto
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция update завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.event.update; CALLS(7): getAdminByIdOrThrow; CALLS(7): getTime; CALLS(7): BadRequestException]
  # END_CONTRACT
  */
  async update(id: string, dto: UpdateEventDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const existing = await this.getAdminByIdOrThrow(id);
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : existing.endsAt;
    if (startsAt.getTime() >= endsAt.getTime()) {
      throw new BadRequestException({ code: "EVENT_INVALID_DATE_RANGE" });
    }
    try {
      return await this.prisma.event.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          type: dto.type,
          status: dto.status,
          startsAt: dto.startsAt ? startsAt : undefined,
          endsAt: dto.endsAt ? endsAt : undefined,
          locationName: dto.locationName,
          locationAddress: dto.locationAddress,
          locationLat: dto.locationLat,
          locationLng: dto.locationLng,
          capacity: dto.capacity,
          registrationOpenAt: dto.registrationOpenAt
            ? new Date(dto.registrationOpenAt)
            : undefined,
          registrationCloseAt: dto.registrationCloseAt
            ? new Date(dto.registrationCloseAt)
            : undefined,
          isPointsEligible: dto.isPointsEligible,
          basePointsAward: dto.basePointsAward,
        },
      });
    } catch (err) {
      if (isUniqueViolation(err, "slug")) {
        throw new ConflictException({ code: "EVENT_SLUG_TAKEN" });
      }
      throw err;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_update

}
// END_CLASS_EventsService


// START_FUNCTION_assertDateRange
/*
# START_CONTRACT:
# PURPOSE: Проверяет условия и ограничения, связанные с доменом events.
# INPUTS:
# - [Входной параметр assertDateRange.] => startsAt: string
# - [Входной параметр assertDateRange.] => endsAt: string
# SIDE_EFFECTS:
# - Может завершиться исключением при нарушении условий выполнения.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция assertDateRange завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): getTime; CALLS(7): BadRequestException]
# END_CONTRACT
*/
function assertDateRange(startsAt: string, endsAt: string) {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new BadRequestException({ code: "EVENT_INVALID_DATE_RANGE" });
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_assertDateRange


// START_FUNCTION_isUniqueViolation
/*
# START_CONTRACT:
# PURPOSE: Проверяет условия и ограничения, связанные с доменом events.
# INPUTS:
# - [Входной параметр isUniqueViolation.] => err: unknown
# - [Входной параметр isUniqueViolation.] => field: string
# OUTPUTS:
# - [boolean] - [Возвращаемое значение операции isUniqueViolation.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция isUniqueViolation завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу boolean.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): isArray; CALLS(7): includes]
# END_CONTRACT
*/
function isUniqueViolation(err: unknown, field: string): boolean {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== "P2002") return false;
  const target = err.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  if (typeof target === "string") return target.includes(field);
  return false;
  // END_BLOCK_MAIN
}
// END_FUNCTION_isUniqueViolation


const publicSyncRuleInclude = Prisma.validator<Prisma.EventSyncRuleDefaultArgs>()({
  include: {
    locations: {
      where: { location: { status: CityLocationStatus.active } },
      select: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            lat: true,
            lng: true,
            radiusMeters: true,
          },
        },
      },
    },
  },
});

type EventWithPublicSyncRule = Prisma.EventGetPayload<{
  include: {
    syncRule: typeof publicSyncRuleInclude;
  };
}>;

// START_FUNCTION_mapEventPublic
/*
# START_CONTRACT:
# PURPOSE: Преобразует данные домена events в прикладной формат.
# INPUTS:
# - [Входной параметр mapEventPublic.] => event: EventWithPublicSyncRule
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция mapEventPublic завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): map]
# END_CONTRACT
*/
function mapEventPublic(event: EventWithPublicSyncRule) {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const { syncRule, ...rest } = event;
  if (!syncRule) return { ...rest, syncRule: null };
  const { locations, geofenceLat, geofenceLng, geofenceRadiusMeters, autoApprove, createdAt, updatedAt, ...publicRule } =
    syncRule;
  void geofenceLat;
  void geofenceLng;
  void geofenceRadiusMeters;
  void autoApprove;
  void createdAt;
  void updatedAt;
  return {
    ...rest,
    syncRule: {
      ...publicRule,
      locations: locations.map((l) => l.location),
    },
  };
  // END_BLOCK_MAIN
}
// END_FUNCTION_mapEventPublic
