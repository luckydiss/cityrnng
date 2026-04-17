/*
# FILE: apps/api/src/events/dto/list-events.query.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена events.
# SCOPE: DTO layer for domain events inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): DTO; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => ListEventsQuery
# END_MODULE_MAP
# START_USE_CASES:
#- [ListEventsQuery]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { EventStatus, EventType } from "@prisma/client";

// START_CLASS_ListEventsQuery
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена events.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class ListEventsQuery {
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
// END_CLASS_ListEventsQuery
