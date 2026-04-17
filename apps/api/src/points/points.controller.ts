/*
# FILE: apps/api/src/points/points.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена points.
# SCOPE: Controller layer for domain points inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => PointsController
# METHOD 7 [Метод класса PointsController.] => constructor
# METHOD 7 [Метод класса PointsController.] => balance
# METHOD 7 [Метод класса PointsController.] => history
# END_MODULE_MAP
# START_USE_CASES:
#- [PointsController.balance]: API Client (HTTP Request) -> ExecuteBalance -> BusinessResultPrepared
#- [PointsController.history]: API Client (HTTP Request) -> ExecuteHistory -> BusinessResultPrepared
# END_USE_CASES
*/

import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/types";
import { ListHistoryQuery } from "./dto/list-history.query";
import { PointsService } from "./points.service";

// START_CLASS_PointsController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена points.
# ATTRIBUTES:
# - [Атрибут класса PointsController.] => points: PointsService) {}
# METHODS:
# - [Выполняет операцию constructor в домене points.] => constructor()
# - [Выполняет операцию balance в домене points.] => balance()
# - [Выполняет операцию history в домене points.] => history()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("points")
export class PointsController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly points: PointsService) {}
  // END_METHOD_constructor


  
  // START_METHOD_balance
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию balance в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get("balance")
  async balance(@CurrentUser() user: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return { balance: await this.points.getBalance(user.id) };
    // END_BLOCK_MAIN
  }
  // END_METHOD_balance


  
  // START_METHOD_history
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию history в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get("history")
  history(@CurrentUser() user: AuthenticatedUser, @Query() query: ListHistoryQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.points.listHistory(user.id, query);
    // END_BLOCK_MAIN
  }
  // END_METHOD_history

}
// END_CLASS_PointsController
