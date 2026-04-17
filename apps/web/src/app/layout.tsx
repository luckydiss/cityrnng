/*
# FILE: apps/web/src/app/layout.tsx
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет UI-маршрут и его рендеринг для фронтенда.
# SCOPE: UIRoute layer for domain web inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): web; LAYER(7): UIRoute; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# FUNC 7 [Функция уровня модуля.] => RootLayout
# CONST 4 [Константа или конфигурационное значение модуля.] => metadata
# END_MODULE_MAP
# START_USE_CASES:
#- [RootLayout]: Web User (Route Rendering) -> ExecuteRootLayout -> ResultPrepared
# END_USE_CASES
*/

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CITYRNNG",
  description: "City running community platform",
};

// START_FUNCTION_RootLayout
/*
# START_CONTRACT:
# PURPOSE: Выполняет операцию RootLayout в домене web.
# INPUTS:
# - [Входной параметр RootLayout.] => { children }: { children: ReactNode }
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция RootLayout завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): web; LAYER(7): UIRoute; TYPE(6): Function]
# END_CONTRACT
*/
export default function RootLayout({ children }: { children: ReactNode }) {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
  // END_BLOCK_MAIN
}
// END_FUNCTION_RootLayout
