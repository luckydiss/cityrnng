/*
# FILE: apps/api/src/locations/dto/list-locations.query.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена locations.
# SCOPE: DTO layer for domain locations inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): DTO; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => ListLocationsQuery
# END_MODULE_MAP
# START_USE_CASES:
#- [ListLocationsQuery]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { CityLocationStatus } from "@prisma/client";

// START_CLASS_ListLocationsQuery
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена locations.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class ListLocationsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsEnum(CityLocationStatus)
  status?: CityLocationStatus;
}
// END_CLASS_ListLocationsQuery
