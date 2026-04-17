/*
# FILE: apps/api/src/users/users.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена users.
# SCOPE: Service layer for domain users inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => UsersService
# METHOD 7 [Метод класса UsersService.] => constructor
# METHOD 7 [Метод класса UsersService.] => findByIdWithRelations
# METHOD 7 [Метод класса UsersService.] => ensureFromVerifiedEmail
# FUNC 7 [Функция уровня модуля.] => defaultDisplayName
# FUNC 7 [Функция уровня модуля.] => rolesOf
# TYPE 5 [Тип или интерфейс прикладного контракта.] => UserWithRelations
# END_MODULE_MAP
# START_USE_CASES:
#- [UsersService.findByIdWithRelations]: Application Service (Business Flow) -> ExecuteFindByIdWithRelations -> BusinessResultPrepared
#- [UsersService.ensureFromVerifiedEmail]: Application Service (Business Flow) -> ExecuteEnsureFromVerifiedEmail -> BusinessResultPrepared
#- [defaultDisplayName]: Application Service (Business Flow) -> ExecuteDefaultDisplayName -> ResultPrepared
#- [rolesOf]: Application Service (Business Flow) -> ExecuteRolesOf -> ResultPrepared
# END_USE_CASES
*/

import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ROLE_RUNNER } from "../auth/types";
import { PointsAwardsService } from "../points/points-awards.service";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: { profile: true; roles: { include: { role: true } } };
}>;

// START_CLASS_UsersService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена users.
# ATTRIBUTES:
# - [Атрибут класса UsersService.] => prisma: PrismaService
# - [Атрибут класса UsersService.] => pointsAwards: PointsAwardsService
# METHODS:
# - [Выполняет операцию constructor в домене users.] => constructor()
# - [Получает данные домена users по заданным условиям.] => findByIdWithRelations()
# - [Выполняет операцию ensureFromVerifiedEmail в домене users.] => ensureFromVerifiedEmail()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class UsersService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене users.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsAwards: PointsAwardsService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_findByIdWithRelations
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена users по заданным условиям.
  # INPUTS:
  # - [Входной параметр findByIdWithRelations.] => id: string
  # OUTPUTS:
  # - [Promise<UserWithRelations | null>] - [Возвращаемое значение операции findByIdWithRelations.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция findByIdWithRelations завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<UserWithRelations | null>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.user.findUnique; CALLS(7): findUnique]
  # END_CONTRACT
  */
  async findByIdWithRelations(id: string): Promise<UserWithRelations | null> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, roles: { include: { role: true } } },
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_findByIdWithRelations


  
  // START_METHOD_ensureFromVerifiedEmail
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию ensureFromVerifiedEmail в домене users.
  # INPUTS:
  # - [Входной параметр ensureFromVerifiedEmail.] => email: string
  # OUTPUTS:
  # - [Promise<UserWithRelations>] - [Возвращаемое значение операции ensureFromVerifiedEmail.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция ensureFromVerifiedEmail завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<UserWithRelations>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.$transaction; CALLS(7): pointsAwards.awardSignupBonus; CALLS(7): transaction; CALLS(7): async]
  # END_CONTRACT
  */
  async ensureFromVerifiedEmail(email: string): Promise<UserWithRelations> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.prisma.$transaction(async (tx) => {
      const runnerRole = await tx.role.upsert({
        where: { code: ROLE_RUNNER },
        update: {},
        create: { code: ROLE_RUNNER, name: "Runner" },
      });

      const existing = await tx.user.findUnique({ where: { email } });
      const isFirstActivation = !existing || existing.status === "pending";
      const user: User = existing
        ? existing.status === "pending"
          ? await tx.user.update({ where: { id: existing.id }, data: { status: "active" } })
          : existing
        : await tx.user.create({ data: { email, status: "active" } });

      await tx.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, displayName: defaultDisplayName(email) },
      });

      await tx.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: runnerRole.id } },
        update: {},
        create: { userId: user.id, roleId: runnerRole.id },
      });

      if (isFirstActivation) {
        await this.pointsAwards.awardSignupBonus(user.id, tx);
      }

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { profile: true, roles: { include: { role: true } } },
      });
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_ensureFromVerifiedEmail

}
// END_CLASS_UsersService


// START_FUNCTION_defaultDisplayName
/*
# START_CONTRACT:
# PURPOSE: Строит отображаемое имя пользователя по данным профиля.
# INPUTS:
# - [Входной параметр defaultDisplayName.] => email: string
# OUTPUTS:
# - [string] - [Возвращаемое значение операции defaultDisplayName.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция defaultDisplayName завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу string.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): split]
# END_CONTRACT
*/
function defaultDisplayName(email: string): string {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const local = email.split("@")[0] ?? "runner";
  return local.length > 0 ? local : "runner";
  // END_BLOCK_MAIN
}
// END_FUNCTION_defaultDisplayName


// START_FUNCTION_rolesOf
/*
# START_CONTRACT:
# PURPOSE: Возвращает набор ролей пользователя в прикладном формате.
# INPUTS:
# - [Входной параметр rolesOf.] => user: UserWithRelations
# OUTPUTS:
# - [string[]] - [Возвращаемое значение операции rolesOf.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция rolesOf завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу string[].
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Service; TYPE(6): Function]
# LINKS: [CALLS(7): map]
# END_CONTRACT
*/
export function rolesOf(user: UserWithRelations): string[] {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  return user.roles.map((r) => r.role.code);
  // END_BLOCK_MAIN
}
// END_FUNCTION_rolesOf
