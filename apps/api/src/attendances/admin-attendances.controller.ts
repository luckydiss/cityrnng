/*
# FILE: apps/api/src/attendances/admin-attendances.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена attendances.
# SCOPE: Controller layer for domain attendances inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AdminAttendancesController
# METHOD 7 [Метод класса AdminAttendancesController.] => constructor
# METHOD 7 [Метод класса AdminAttendancesController.] => approve
# METHOD 7 [Метод класса AdminAttendancesController.] => reject
# END_MODULE_MAP
# START_USE_CASES:
#- [AdminAttendancesController.approve]: API Client (HTTP Request) -> ExecuteApprove -> BusinessResultPrepared
#- [AdminAttendancesController.reject]: API Client (HTTP Request) -> ExecuteReject -> BusinessResultPrepared
# END_USE_CASES
*/

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ROLE_ADMIN, type AuthenticatedUser } from "../auth/types";
import { AttendancesService } from "./attendances.service";
import { RejectAttendanceDto } from "./dto/reject-attendance.dto";

// START_CLASS_AdminAttendancesController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена attendances.
# ATTRIBUTES:
# - [Атрибут класса AdminAttendancesController.] => attendances: AttendancesService) {}
# METHODS:
# - [Выполняет операцию constructor в домене attendances.] => constructor()
# - [Подтверждает действие или сущность в домене attendances.] => approve()
# - [Отклоняет действие или сущность в домене attendances.] => reject()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("admin/attendances")
@UseGuards(RolesGuard)
@Roles(ROLE_ADMIN)
export class AdminAttendancesController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене attendances.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly attendances: AttendancesService) {}
  // END_METHOD_constructor


  
  // START_METHOD_approve
  /*
  # START_CONTRACT:
  # PURPOSE: Подтверждает действие или сущность в домене attendances.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  approve(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.attendances.approve(id, user.id);
    // END_BLOCK_MAIN
  }
  // END_METHOD_approve


  
  // START_METHOD_reject
  /*
  # START_CONTRACT:
  # PURPOSE: Отклоняет действие или сущность в домене attendances.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): attendances; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  reject(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: RejectAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.attendances.reject(id, user.id, dto.reason);
    // END_BLOCK_MAIN
  }
  // END_METHOD_reject

}
// END_CLASS_AdminAttendancesController
