/*
# FILE: apps/web/src/app/page.tsx
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
# FUNC 7 [Функция уровня модуля.] => HomePage
# END_MODULE_MAP
# START_USE_CASES:
#- [HomePage]: Web User (Route Rendering) -> ExecuteHomePage -> ResultPrepared
# END_USE_CASES
*/

// START_FUNCTION_HomePage
/*
# START_CONTRACT:
# PURPOSE: Выполняет операцию HomePage в домене web.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция HomePage завершает основной сценарий без нарушения ожидаемого контракта.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): web; LAYER(7): UIRoute; TYPE(6): Function]
# END_CONTRACT
*/
export default function HomePage() {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">CITYRNNG</h1>
      <p className="text-lg text-neutral-600">City running community — bootstrap.</p>
    </main>
  );
  // END_BLOCK_MAIN
}
// END_FUNCTION_HomePage
