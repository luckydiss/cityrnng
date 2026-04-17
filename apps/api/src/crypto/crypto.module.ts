/*
# FILE: apps/api/src/crypto/crypto.module.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена crypto.
# SCOPE: Module layer for domain crypto inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Module; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => CryptoModule
# END_MODULE_MAP
# START_USE_CASES:
#- [CryptoModule]: NestJS Module Loader -> InitializeModuleComponent -> RuntimeReady
# END_USE_CASES
*/

import { Global, Module } from "@nestjs/common";
import { CryptoService } from "./crypto.service";

@Global()
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})

// START_CLASS_CryptoModule
/*
# START_CONTRACT:
# PURPOSE: Связывает провайдеры и экспортирует зависимости домена crypto.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Module; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
export class CryptoModule {}
// END_CLASS_CryptoModule
