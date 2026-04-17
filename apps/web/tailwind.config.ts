/*
# FILE: apps/web/tailwind.config.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Содержит вспомогательный прикладной код домена project.
# SCOPE: Support layer for domain project inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): project; LAYER(7): Support; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CONST 4 [Константа или конфигурационное значение модуля.] => config
# END_MODULE_MAP
# START_USE_CASES:
#- [tailwind.config]: Application Layer -> SupportRuntimeConfiguration -> ContextPrepared
# END_USE_CASES
*/

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
