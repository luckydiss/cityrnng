/*
# FILE: apps/api/src/app.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена app.module.
# SCOPE: Module layer for domain app.module inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): app.module; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AppModule
# CONST 4 [Константа или конфигурационное значение модуля.] => monorepoRootEnv
# END_MODULE_MAP
# START_USE_CASES:
#- [AppModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { resolve } from "node:path";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MeModule } from "./me/me.module";
import { EventsModule } from "./events/events.module";
import { AttendancesModule } from "./attendances/attendances.module";
import { CryptoModule } from "./crypto/crypto.module";
import { StravaModule } from "./integrations/strava/strava.module";
import { LocationsModule } from "./locations/locations.module";
import { PointsModule } from "./points/points.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

// Load .env from the monorepo root regardless of cwd. In production, env vars
// come from the host/container — ConfigModule simply skips missing files.
// __dirname at runtime is apps/api/dist → repo root is three levels up.
const monorepoRootEnv = resolve(__dirname, "..", "..", "..", ".env");

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [monorepoRootEnv],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    MeModule,
    EventsModule,
    AttendancesModule,
    CryptoModule,
    StravaModule,
    LocationsModule,
    PointsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})

// START_CLASS_AppModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена app.module.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): app.module; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class AppModule {}
// END_CLASS_AppModule
