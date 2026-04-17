/*
# FILE: apps/api/src/events/dto/upsert-sync-rule.dto.ts
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
# CLASS 9 [Основной класс модуля.] => UpsertSyncRuleDto
# END_MODULE_MAP
# START_USE_CASES:
#- [UpsertSyncRuleDto]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import { SyncProvider } from "@prisma/client";

// START_CLASS_UpsertSyncRuleDto
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена events.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): events; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class UpsertSyncRuleDto {
  @IsOptional()
  @IsEnum(SyncProvider)
  provider?: SyncProvider;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  activityType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDistanceMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDistanceMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDurationSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDurationSeconds?: number;

  @IsDateString()
  windowStartsAt!: string;

  @IsDateString()
  windowEndsAt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  geofenceLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  geofenceLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  geofenceRadiusMeters?: number;

  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  @ArrayUnique()
  @IsUUID("4", { each: true })
  locationIds?: string[];
}
// END_CLASS_UpsertSyncRuleDto
