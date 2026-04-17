/*
# FILE: apps/api/src/events/admin-events.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена events.
# SCOPE: Controller layer for domain events inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => ListAttendancesQuery
# CLASS 9 [Основной класс модуля.] => AdminEventsController
# METHOD 7 [Метод класса AdminEventsController.] => constructor
# METHOD 7 [Метод класса AdminEventsController.] => create
# METHOD 7 [Метод класса AdminEventsController.] => update
# METHOD 7 [Метод класса AdminEventsController.] => upsertSyncRule
# METHOD 7 [Метод класса AdminEventsController.] => listAttendances
# END_MODULE_MAP
# START_USE_CASES:
#- [ListAttendancesQuery]: API Client (HTTP Request) -> InitializeModuleComponent -> RuntimeReady
#- [AdminEventsController.create]: API Client (HTTP Request) -> ExecuteCreate -> BusinessResultPrepared
#- [AdminEventsController.update]: API Client (HTTP Request) -> ExecuteUpdate -> BusinessResultPrepared
#- [AdminEventsController.upsertSyncRule]: API Client (HTTP Request) -> ExecuteUpsertSyncRule -> BusinessResultPrepared
#- [AdminEventsController.listAttendances]: API Client (HTTP Request) -> ExecuteListAttendances -> BusinessResultPrepared
# END_USE_CASES
*/

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AttendanceStatus } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ROLE_ADMIN, type AuthenticatedUser } from "../auth/types";
import { AttendancesService } from "../attendances/attendances.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { UpsertSyncRuleDto } from "./dto/upsert-sync-rule.dto";
import { EventsService } from "./events.service";
import { SyncRulesService } from "./sync-rules.service";
import {
  IsEnum,
  IsOptional,
} from "class-validator";

// START_CLASS_ListAttendancesQuery
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена events.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
class ListAttendancesQuery {
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
// END_CLASS_ListAttendancesQuery


// START_CLASS_AdminEventsController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена events.
# ATTRIBUTES:
# - [Атрибут класса AdminEventsController.] => events: EventsService
# - [Атрибут класса AdminEventsController.] => syncRules: SyncRulesService
# - [Атрибут класса AdminEventsController.] => attendances: AttendancesService
# METHODS:
# - [Выполняет операцию constructor в домене events.] => constructor()
# - [Создает новую сущность или запись домена events.] => create()
# - [Обновляет состояние или данные домена events.] => update()
# - [Обновляет состояние или данные домена events.] => upsertSyncRule()
# - [Возвращает список сущностей или записей домена events.] => listAttendances()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("admin/events")
@UseGuards(RolesGuard)
@Roles(ROLE_ADMIN)
export class AdminEventsController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly events: EventsService,
    private readonly syncRules: SyncRulesService,
    private readonly attendances: AttendancesService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_create
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новую сущность или запись домена events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Post()
  create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.events.create(dto, user.id);
    // END_BLOCK_MAIN
  }
  // END_METHOD_create


  
  // START_METHOD_update
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.events.update(id, dto);
    // END_BLOCK_MAIN
  }
  // END_METHOD_update


  
  // START_METHOD_upsertSyncRule
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Put(":id/sync-rules")
  upsertSyncRule(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpsertSyncRuleDto,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.syncRules.upsertForEvent(id, dto);
    // END_BLOCK_MAIN
  }
  // END_METHOD_upsertSyncRule


  
  // START_METHOD_listAttendances
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get(":id/attendances")
  listAttendances(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Query() query: ListAttendancesQuery,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.attendances.listForEvent(id, query.status);
    // END_BLOCK_MAIN
  }
  // END_METHOD_listAttendances

}
// END_CLASS_AdminEventsController
