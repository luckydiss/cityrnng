/*
# FILE: apps/api/src/locations/locations.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена locations.
# SCOPE: Module layer for domain locations inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => LocationsModule
# END_MODULE_MAP
# START_USE_CASES:
#- [LocationsModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Module } from "@nestjs/common";
import { AdminLocationsController } from "./admin-locations.controller";
import { LocationsService } from "./locations.service";

@Module({
  controllers: [AdminLocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})

// START_CLASS_LocationsModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена locations.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class LocationsModule {}
// END_CLASS_LocationsModule
