/*
# FILE: apps/api/src/main.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Инициализирует runtime-конфигурацию приложения и запускает API.
# SCOPE: EntryPoint layer for domain main inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): main; LAYER(7): EntryPoint; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# FUNC 7 [Функция уровня модуля.] => bootstrap
# END_MODULE_MAP
# START_USE_CASES:
#- [bootstrap]: System (Startup) -> ExecuteBootstrap -> ResultPrepared
# END_USE_CASES
*/

import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import type { Env } from "./config/env.schema";

// START_FUNCTION_bootstrap
/*
# START_CONTRACT:
# PURPOSE: Инициализирует приложение и запускает HTTP-сервер.
# SIDE_EFFECTS:
# - Запускает сетевой listener приложения.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция bootstrap завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): main; LAYER(7): EntryPoint; TYPE(6): Function]
# LINKS: [CALLS(7): create; CALLS(7): setGlobalPrefix; CALLS(7): useGlobalPipes; CALLS(7): ValidationPipe]
# END_CONTRACT
*/
async function bootstrap() {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = app.get(ConfigService<Env, true>);
  const port = config.get("API_PORT", { infer: true });
  await app.listen(port);
  // END_BLOCK_MAIN
}
// END_FUNCTION_bootstrap


void bootstrap();
