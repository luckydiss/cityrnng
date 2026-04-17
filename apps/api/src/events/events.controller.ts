/*
# FILE: apps/api/src/events/events.controller.ts
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
# CLASS 9 [Основной класс модуля.] => EventsController
# METHOD 7 [Метод класса EventsController.] => constructor
# METHOD 7 [Метод класса EventsController.] => list
# METHOD 7 [Метод класса EventsController.] => getOne
# END_MODULE_MAP
# START_USE_CASES:
#- [EventsController.list]: API Client (HTTP Request) -> ExecuteList -> BusinessResultPrepared
#- [EventsController.getOne]: API Client (HTTP Request) -> ExecuteGetOne -> BusinessResultPrepared
# END_USE_CASES
*/

import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { EventsService } from "./events.service";
import { ListEventsQuery } from "./dto/list-events.query";

// START_CLASS_EventsController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена events.
# ATTRIBUTES:
# - [Атрибут класса EventsController.] => events: EventsService) {}
# METHODS:
# - [Выполняет операцию constructor в домене events.] => constructor()
# - [Возвращает список сущностей или записей домена events.] => list()
# - [Получает данные домена events по заданным условиям.] => getOne()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("events")
@Public()
export class EventsController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly events: EventsService) {}
  // END_METHOD_constructor


  
  // START_METHOD_list
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена events.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get()
  list(@Query() query: ListEventsQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.events.listPublic(query);
    // END_BLOCK_MAIN
  }
  // END_METHOD_list


  
  // START_METHOD_getOne
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена events по заданным условиям.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get(":id")
  getOne(@Param("id", new ParseUUIDPipe()) id: string) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.events.getByIdOrThrow(id);
    // END_BLOCK_MAIN
  }
  // END_METHOD_getOne

}
// END_CLASS_EventsController
