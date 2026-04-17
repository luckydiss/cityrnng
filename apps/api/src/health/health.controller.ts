/*
# FILE: apps/api/src/health/health.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена health.
# SCOPE: Controller layer for domain health inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): health; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => HealthController
# METHOD 7 [Метод класса HealthController.] => constructor
# METHOD 7 [Метод класса HealthController.] => check
# METHOD 7 [Метод класса HealthController.] => checkDb
# END_MODULE_MAP
# START_USE_CASES:
#- [HealthController.check]: API Client (HTTP Request) -> ExecuteCheck -> BusinessResultPrepared
#- [HealthController.checkDb]: API Client (HTTP Request) -> ExecuteCheckDb -> BusinessResultPrepared
# END_USE_CASES
*/

import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";

// START_CLASS_HealthController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена health.
# ATTRIBUTES:
# - [Атрибут класса HealthController.] => prisma: PrismaService) {}
# METHODS:
# - [Выполняет операцию constructor в домене health.] => constructor()
# - [Проверяет условия и ограничения, связанные с доменом health.] => check()
# - [Проверяет условия и ограничения, связанные с доменом health.] => checkDb()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): health; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("health")
@Public()
export class HealthController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене health.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): health; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly prisma: PrismaService) {}
  // END_METHOD_constructor


  
  // START_METHOD_check
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет условия и ограничения, связанные с доменом health.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): health; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get()
  check() {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return { status: "ok" };
    // END_BLOCK_MAIN
  }
  // END_METHOD_check


  
  // START_METHOD_checkDb
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет условия и ограничения, связанные с доменом health.
  # INPUTS:
  # - [Входной параметр checkDb.] => "db": unknown
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция checkDb завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): health; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): HttpException]
  # END_CONTRACT
  */
  @Get("db")
  async checkDb() {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "ok" };
    } catch {
      throw new HttpException(
        { status: "error", db: "down" },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_checkDb

}
// END_CLASS_HealthController
