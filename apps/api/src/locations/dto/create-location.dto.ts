/*
# FILE: apps/api/src/locations/dto/create-location.dto.ts
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
# CLASS 9 [Основной класс модуля.] => CreateLocationDto
# CONST 4 [Константа или конфигурационное значение модуля.] => SLUG_REGEX
# END_MODULE_MAP
# START_USE_CASES:
#- [CreateLocationDto]: Validation Layer -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { CityLocationStatus } from "@prisma/client";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// START_CLASS_CreateLocationDto
/*
# START_CONTRACT:
# PURPOSE: Описывает контракт входных и выходных данных домена locations.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): locations; LAYER(7): DTO; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class CreateLocationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @Matches(SLUG_REGEX, { message: "slug must be lowercase, hyphen-separated" })
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @Type(() => Number)
  @IsLongitude()
  lng!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  radiusMeters?: number;

  @IsOptional()
  @IsEnum(CityLocationStatus)
  status?: CityLocationStatus;
}
// END_CLASS_CreateLocationDto
