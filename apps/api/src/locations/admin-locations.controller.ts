/*
# FILE: apps/api/src/locations/admin-locations.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена locations.
# SCOPE: Controller layer for domain locations inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AdminLocationsController
# METHOD 7 [Метод класса AdminLocationsController.] => constructor
# METHOD 7 [Метод класса AdminLocationsController.] => list
# METHOD 7 [Метод класса AdminLocationsController.] => create
# METHOD 7 [Метод класса AdminLocationsController.] => update
# END_MODULE_MAP
# START_USE_CASES:
#- [AdminLocationsController.list]: API Client (HTTP Request) -> ExecuteList -> BusinessResultPrepared
#- [AdminLocationsController.create]: API Client (HTTP Request) -> ExecuteCreate -> BusinessResultPrepared
#- [AdminLocationsController.update]: API Client (HTTP Request) -> ExecuteUpdate -> BusinessResultPrepared
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
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ROLE_ADMIN } from "../auth/types";
import { CreateLocationDto } from "./dto/create-location.dto";
import { ListLocationsQuery } from "./dto/list-locations.query";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { LocationsService } from "./locations.service";

// START_CLASS_AdminLocationsController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена locations.
# ATTRIBUTES:
# - [Атрибут класса AdminLocationsController.] => locations: LocationsService) {}
# METHODS:
# - [Выполняет операцию constructor в домене locations.] => constructor()
# - [Возвращает список сущностей или записей домена locations.] => list()
# - [Создает новую сущность или запись домена locations.] => create()
# - [Обновляет состояние или данные домена locations.] => update()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("admin/locations")
@UseGuards(RolesGuard)
@Roles(ROLE_ADMIN)
export class AdminLocationsController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене locations.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly locations: LocationsService) {}
  // END_METHOD_constructor


  
  // START_METHOD_list
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена locations.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get()
  list(@Query() query: ListLocationsQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.locations.list(query);
    // END_BLOCK_MAIN
  }
  // END_METHOD_list


  
  // START_METHOD_create
  /*
  # START_CONTRACT:
  # PURPOSE: Создает новую сущность или запись домена locations.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Post()
  create(@Body() dto: CreateLocationDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.locations.create(dto);
    // END_BLOCK_MAIN
  }
  // END_METHOD_create


  
  // START_METHOD_update
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена locations.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.locations.update(id, dto);
    // END_BLOCK_MAIN
  }
  // END_METHOD_update

}
// END_CLASS_AdminLocationsController
