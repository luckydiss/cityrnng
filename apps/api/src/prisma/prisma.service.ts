/*
# FILE: apps/api/src/prisma/prisma.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена prisma.
# SCOPE: Service layer for domain prisma inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): prisma; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => PrismaService
# METHOD 7 [Метод класса PrismaService.] => onModuleDestroy
# END_MODULE_MAP
# START_USE_CASES:
#- [PrismaService.onModuleDestroy]: Application Service (Business Flow) -> ExecuteOnModuleDestroy -> BusinessResultPrepared
# END_USE_CASES
*/

import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// START_CLASS_PrismaService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена prisma.
# METHODS:
# - [Выполняет операцию onModuleDestroy в домене prisma.] => onModuleDestroy()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): prisma; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  
  // START_METHOD_onModuleDestroy
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию onModuleDestroy в домене prisma.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): prisma; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  async onModuleDestroy(): Promise<void> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    await this.$disconnect();
    // END_BLOCK_MAIN
  }
  // END_METHOD_onModuleDestroy

}
// END_CLASS_PrismaService
