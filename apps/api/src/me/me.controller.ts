/*
# FILE: apps/api/src/me/me.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена me.
# SCOPE: Controller layer for domain me inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): me; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => MeController
# METHOD 7 [Метод класса MeController.] => constructor
# METHOD 7 [Метод класса MeController.] => me
# END_MODULE_MAP
# START_USE_CASES:
#- [MeController.me]: API Client (HTTP Request) -> ExecuteMe -> BusinessResultPrepared
# END_USE_CASES
*/

import { Controller, Get, NotFoundException } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UsersService, rolesOf } from "../users/users.service";
import type { AuthenticatedUser } from "../auth/types";

// START_CLASS_MeController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена me.
# ATTRIBUTES:
# - [Атрибут класса MeController.] => users: UsersService) {}
# METHODS:
# - [Выполняет операцию constructor в домене me.] => constructor()
# - [Выполняет операцию me в домене me.] => me()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): me; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("me")
export class MeController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене me.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): me; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly users: UsersService) {}
  // END_METHOD_constructor


  
  // START_METHOD_me
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию me в домене me.
  # SIDE_EFFECTS:
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция me завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): me; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): users.findByIdWithRelations; CALLS(7): findByIdWithRelations; CALLS(7): NotFoundException; CALLS(7): rolesOf]
  # END_CONTRACT
  */
  @Get()
  async me(@CurrentUser() current: AuthenticatedUser) {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const user = await this.users.findByIdWithRelations(current.id);
    if (!user) throw new NotFoundException({ code: "USER_NOT_FOUND" });
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: rolesOf(user),
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            city: user.profile.city,
            instagramHandle: user.profile.instagramHandle,
            telegramHandle: user.profile.telegramHandle,
          }
        : null,
    };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_me

}
// END_CLASS_MeController
