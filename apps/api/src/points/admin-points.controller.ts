/*
# FILE: apps/api/src/points/admin-points.controller.ts
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
# CLASS 9 [Основной класс модуля.] => AdminPointsController
# METHOD 7 [Метод класса AdminPointsController.] => constructor
# METHOD 7 [Метод класса AdminPointsController.] => adjust
# END_MODULE_MAP
# START_USE_CASES:
#- [AdminPointsController.adjust]: API Client (HTTP Request) -> ExecuteAdjust -> BusinessResultPrepared
# END_USE_CASES
*/

import { randomUUID } from "node:crypto";
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { PointActorType, PointReasonType } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ROLE_ADMIN, type AuthenticatedUser } from "../auth/types";
import { AdjustPointsDto } from "./dto/adjust-points.dto";
import { PointsService } from "./points.service";

// START_CLASS_AdminPointsController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена points.
# ATTRIBUTES:
# - [Атрибут класса AdminPointsController.] => points: PointsService) {}
# METHODS:
# - [Выполняет операцию constructor в домене points.] => constructor()
# - [Обновляет состояние или данные домена points.] => adjust()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("admin/points")
@UseGuards(RolesGuard)
@Roles(ROLE_ADMIN)
export class AdminPointsController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене points.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly points: PointsService) {}
  // END_METHOD_constructor


  
  // START_METHOD_adjust
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена points.
  # INPUTS:
  # - [Входной параметр adjust.] => "adjust": unknown
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция adjust завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): points.post; CALLS(7): randomUUID; CALLS(7): post]
  # END_CONTRACT
  */
  @Post("adjust")
  @HttpCode(HttpStatus.OK)
  adjust(@Body() dto: AdjustPointsDto, @CurrentUser() admin: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const idempotencyKey = dto.idempotencyKey
      ? `manual_adjustment:${dto.idempotencyKey}`
      : `manual_adjustment:${randomUUID()}`;
    return this.points.post({
      userId: dto.userId,
      direction: dto.direction,
      amount: dto.amount,
      reasonType: PointReasonType.manual_adjustment,
      idempotencyKey,
      comment: dto.comment,
      actor: { type: PointActorType.admin, id: admin.id },
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_adjust

}
// END_CLASS_AdminPointsController
