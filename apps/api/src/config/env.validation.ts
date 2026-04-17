/*
# FILE: apps/api/src/config/env.validation.ts
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
# FUNC 7 [Функция уровня модуля.] => validateEnv
# END_MODULE_MAP
# START_USE_CASES:
#- [validateEnv]: Runtime Environment -> ExecuteValidateEnv -> ResultPrepared
# END_USE_CASES
*/

import { envSchema, type Env } from "./env.schema";

// START_FUNCTION_validateEnv
/*
# START_CONTRACT:
# PURPOSE: Проверяет конфигурацию окружения и возвращает валидированные значения.
# INPUTS:
# - [Входной параметр validateEnv.] => config: Record<string, unknown>
# OUTPUTS:
# - [Env] - [Возвращаемое значение операции validateEnv.]
# SIDE_EFFECTS:
# - Может завершиться исключением при нарушении условий выполнения.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция validateEnv завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу Env.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): config; LAYER(7): Config; TYPE(6): Function]
# LINKS: [CALLS(7): safeParse; CALLS(7): map; CALLS(7): join; CALLS(7): Error]
# END_CONTRACT
*/
export function validateEnv(config: Record<string, unknown>): Env {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
  // END_BLOCK_MAIN
}
// END_FUNCTION_validateEnv
