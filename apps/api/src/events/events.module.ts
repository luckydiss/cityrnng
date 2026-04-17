/*
# FILE: apps/api/src/events/events.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена events.
# SCOPE: Module layer for domain events inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => EventsModule
# END_MODULE_MAP
# START_USE_CASES:
#- [EventsModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Module } from "@nestjs/common";
import { AttendancesModule } from "../attendances/attendances.module";
import { AdminEventsController } from "./admin-events.controller";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { SyncRulesService } from "./sync-rules.service";

@Module({
  imports: [AttendancesModule],
  controllers: [EventsController, AdminEventsController],
  providers: [EventsService, SyncRulesService],
  exports: [EventsService],
})

// START_CLASS_EventsModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена events.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class EventsModule {}
// END_CLASS_EventsModule
