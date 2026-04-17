/*
# FILE: apps/api/src/integrations/strava/strava.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена strava.
# SCOPE: Module layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => StravaModule
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AttendancesModule } from "../../attendances/attendances.module";
import { AdminStravaController } from "./admin-strava.controller";
import { StravaApiClient } from "./strava-api.client";
import { StravaAccountsService } from "./strava-accounts.service";
import { StravaActivitiesService } from "./strava-activities.service";
import { StravaController } from "./strava.controller";
import { StravaIngestionService } from "./strava-ingestion.service";
import { StravaOAuthService } from "./strava-oauth.service";

@Module({
  imports: [JwtModule.register({}), AttendancesModule],
  controllers: [StravaController, AdminStravaController],
  providers: [
    StravaApiClient,
    StravaOAuthService,
    StravaAccountsService,
    StravaActivitiesService,
    StravaIngestionService,
  ],
  exports: [StravaAccountsService, StravaActivitiesService, StravaIngestionService],
})

// START_CLASS_StravaModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена strava.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class StravaModule {}
// END_CLASS_StravaModule
