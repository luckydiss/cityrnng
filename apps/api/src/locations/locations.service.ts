/*
# FILE: apps/api/src/locations/locations.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена locations.
# SCOPE: Service layer for domain locations inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => LocationsService
# METHOD 7 [Метод класса LocationsService.] => constructor
# METHOD 7 [Метод класса LocationsService.] => list
# METHOD 7 [Метод класса LocationsService.] => create
# METHOD 7 [Метод класса LocationsService.] => update
# FUNC 7 [Функция уровня модуля.] => isUniqueViolation
# END_MODULE_MAP
# START_USE_CASES:
#- [LocationsService.list]: Application Service (Business Flow) -> ExecuteList -> BusinessResultPrepared
#- [LocationsService.create]: Application Service (Business Flow) -> ExecuteCreate -> BusinessResultPrepared
#- [LocationsService.update]: Application Service (Business Flow) -> ExecuteUpdate -> BusinessResultPrepared
#- [isUniqueViolation]: Application Service (Business Flow) -> ExecuteIsUniqueViolation -> ResultPrepared
# END_USE_CASES
*/

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { ListLocationsQuery } from "./dto/list-locations.query";
import { UpdateLocationDto } from "./dto/update-location.dto";

// START_CLASS_LocationsService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена locations.
# ATTRIBUTES:
# - [Атрибут класса LocationsService.] => prisma: PrismaService) {}
# METHODS:
# - [Выполняет операцию constructor в домене locations.] => constructor()
# - [Возвращает список сущностей или записей домена locations.] => list()
# - [Создает новую сущность или запись домена locations.] => create()
# - [Обновляет состояние или данные домена locations.] => update()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class LocationsService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене locations.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly prisma: PrismaService) {}
  // END_METHOD_constructor


  
  // START_METHOD_list
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена locations.
  # INPUTS:
  # - [Входной параметр list.] => query: ListLocationsQuery
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция list завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.cityLocation.findMany; CALLS(7): findMany]
  # END_CONTRACT
  */
  list(query: ListLocationsQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.prisma.cityLocation.findMany({
      where: {
        city: query.city ? { equals: query.city, mode: "insensitive" } : undefined,
        status: query.status,
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_list


  
  // START_METHOD_create
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новую сущность или запись домена locations.
  # INPUTS:
  # - [Входной параметр create.] => dto: CreateLocationDto
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция create завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.cityLocation.create; CALLS(7): create; CALLS(7): isUniqueViolation; CALLS(7): ConflictException]
  # END_CONTRACT
  */
  async create(dto: CreateLocationDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    try {
      return await this.prisma.cityLocation.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          city: dto.city,
          lat: dto.lat,
          lng: dto.lng,
          radiusMeters: dto.radiusMeters,
          status: dto.status,
        },
      });
    } catch (err) {
      if (isUniqueViolation(err, "slug")) {
        throw new ConflictException({ code: "LOCATION_SLUG_TAKEN" });
      }
      throw err;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_create


  
  // START_METHOD_update
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена locations.
  # INPUTS:
  # - [Входной параметр update.] => id: string
  # - [Входной параметр update.] => dto: UpdateLocationDto
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция update завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.cityLocation.findUnique; CALLS(7): prisma.cityLocation.update; CALLS(7): findUnique; CALLS(7): NotFoundException]
  # END_CONTRACT
  */
  async update(id: string, dto: UpdateLocationDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const existing = await this.prisma.cityLocation.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: "LOCATION_NOT_FOUND" });
    try {
      return await this.prisma.cityLocation.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          city: dto.city,
          lat: dto.lat,
          lng: dto.lng,
          radiusMeters: dto.radiusMeters,
          status: dto.status,
        },
      });
    } catch (err) {
      if (isUniqueViolation(err, "slug")) {
        throw new ConflictException({ code: "LOCATION_SLUG_TAKEN" });
      }
      throw err;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_update

}
// END_CLASS_LocationsService


// START_FUNCTION_isUniqueViolation
/*
# START_CONTRACT:
# PURPOSE: Проверяет условия и ограничения, связанные с доменом locations.
# INPUTS:
# - [Входной параметр isUniqueViolation.] => err: unknown
# - [Входной параметр isUniqueViolation.] => field: string
# OUTPUTS:
# - [boolean] - [Возвращаемое значение операции isUniqueViolation.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция isUniqueViolation завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу boolean.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Service; TYPE(6): Function]
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
