/*
# FILE: apps/api/src/config/env.schema.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет конфигурацию и валидацию окружения приложения.
# SCOPE: Config layer for domain config inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): config; LAYER(7): Config; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# TYPE 5 [Тип или интерфейс прикладного контракта.] => Env
# CONST 4 [Константа или конфигурационное значение модуля.] => envSchema
# END_MODULE_MAP
# START_USE_CASES:
#- [env.schema]: Runtime Environment -> SupportRuntimeConfiguration -> ContextPrepared
# END_USE_CASES
*/

import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  LOGIN_CHALLENGE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  AUTH_DEV_RETURN_TOKEN: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true" || v === "1")
    .default(false),
  TOKEN_ENCRYPTION_KEY: z
    .string()
    .refine((v) => {
      try {
        return Buffer.from(v, "base64").length === 32;
      } catch {
        return false;
      }
    }, "TOKEN_ENCRYPTION_KEY must be a 32-byte base64 string"),
  STRAVA_CLIENT_ID: z.string().min(1),
  STRAVA_CLIENT_SECRET: z.string().min(1),
  STRAVA_REDIRECT_URI: z.string().url(),
  STRAVA_SCOPES: z.string().default("read,activity:read"),
  WELCOME_BONUS_POINTS: z.coerce.number().int().nonnegative().default(100),
  EVENT_ATTENDANCE_REGULAR_POINTS_FALLBACK: z.coerce.number().int().nonnegative().default(0),
  EVENT_ATTENDANCE_SPECIAL_POINTS_FALLBACK: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof envSchema>;
