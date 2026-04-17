/*
# FILE: apps/api/src/integrations/strava/dto/callback.query.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена strava.
# SCOPE: DTO layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): DTO; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => StravaCallbackQuery
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaCallbackQuery]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { IsOptional, IsString, MaxLength } from "class-validator";

// START_CLASS_StravaCallbackQuery
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена strava.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class StravaCallbackQuery {
  @IsOptional()
  @IsString()
  @MaxLength(512)
  code?: string;

  @IsString()
  @MaxLength(2048)
  state!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  scope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  error?: string;
}
// END_CLASS_StravaCallbackQuery
