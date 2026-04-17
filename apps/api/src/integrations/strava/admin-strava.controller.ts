/*
# FILE: apps/api/src/integrations/strava/admin-strava.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена strava.
# SCOPE: Controller layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AdminStravaController
# METHOD 7 [Метод класса AdminStravaController.] => constructor
# METHOD 7 [Метод класса AdminStravaController.] => sync
# METHOD 7 [Метод класса AdminStravaController.] => match
# END_MODULE_MAP
# START_USE_CASES:
#- [AdminStravaController.sync]: API Client (HTTP Request) -> ExecuteSync -> BusinessResultPrepared
#- [AdminStravaController.match]: API Client (HTTP Request) -> ExecuteMatch -> BusinessResultPrepared
# END_USE_CASES
*/

import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../../auth/decorators/roles.decorator";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { ROLE_ADMIN } from "../../auth/types";
import { AttendanceMatcherService } from "../../attendances/attendance-matcher.service";
import { AdminSyncDto } from "./dto/admin-sync.dto";
import { StravaIngestionService } from "./strava-ingestion.service";

// START_CLASS_AdminStravaController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена strava.
# ATTRIBUTES:
# - [Атрибут класса AdminStravaController.] => ingestion: StravaIngestionService
# - [Атрибут класса AdminStravaController.] => matcher: AttendanceMatcherService
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Выполняет операцию sync в домене strava.] => sync()
# - [Выполняет операцию match в домене strava.] => match()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("admin/integrations/strava")
@UseGuards(RolesGuard)
@Roles(ROLE_ADMIN)
export class AdminStravaController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly ingestion: StravaIngestionService,
    private readonly matcher: AttendanceMatcherService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_sync
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию sync в домене strava.
  # INPUTS:
  # - [Входной параметр sync.] => "sync": unknown
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция sync завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): ingestion.ingestForUser; CALLS(7): matcher.matchForUser; CALLS(7): ingestForUser; CALLS(7): matchForUser]
  # END_CONTRACT
  */
  @Post("sync")
  @HttpCode(HttpStatus.OK)
  async sync(@Body() dto: AdminSyncDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const range = {
      after: dto.after ? new Date(dto.after) : undefined,
      before: dto.before ? new Date(dto.before) : undefined,
    };
    const ingestion = await this.ingestion.ingestForUser(dto.userId, range);
    const matching = await this.matcher.matchForUser(dto.userId, range);
    return { ingestion, matching };
    // END_BLOCK_MAIN
  }
  // END_METHOD_sync


  
  // START_METHOD_match
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию match в домене strava.
  # INPUTS:
  # - [Входной параметр match.] => "match": unknown
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция match завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): matcher.matchForUser; CALLS(7): matchForUser]
  # END_CONTRACT
  */
  @Post("match")
  @HttpCode(HttpStatus.OK)
  async match(@Body() dto: AdminSyncDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const matching = await this.matcher.matchForUser(dto.userId, {
      after: dto.after ? new Date(dto.after) : undefined,
      before: dto.before ? new Date(dto.before) : undefined,
    });
    return { matching };
    // END_BLOCK_MAIN
  }
  // END_METHOD_match

}
// END_CLASS_AdminStravaController
