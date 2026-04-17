/*
# FILE: apps/api/src/points/dto/adjust-points.dto.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена points.
# SCOPE: DTO layer for domain points inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): DTO; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AdjustPointsDto
# END_MODULE_MAP
# START_USE_CASES:
#- [AdjustPointsDto]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { PointDirection } from "@prisma/client";

// START_CLASS_AdjustPointsDto
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена points.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): points; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class AdjustPointsDto {
  @IsUUID()
  userId!: string;

  @IsEnum(PointDirection)
  direction!: PointDirection;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  comment!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  idempotencyKey?: string;
}
// END_CLASS_AdjustPointsDto
