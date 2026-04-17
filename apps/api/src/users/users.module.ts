/*
# FILE: apps/api/src/users/users.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена users.
# SCOPE: Module layer for domain users inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => UsersModule
# END_MODULE_MAP
# START_USE_CASES:
#- [UsersModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Module } from "@nestjs/common";
import { PointsModule } from "../points/points.module";
import { UsersService } from "./users.service";

@Module({
  imports: [PointsModule],
  providers: [UsersService],
  exports: [UsersService],
})

// START_CLASS_UsersModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена users.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): users; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class UsersModule {}
// END_CLASS_UsersModule
