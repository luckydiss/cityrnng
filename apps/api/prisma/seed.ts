/*
# FILE: apps/api/prisma/seed.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Заполняет базу стартовыми данными для разработки и локального запуска.
# SCOPE: Seed layer for domain database inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): database; LAYER(7): Seed; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# FUNC 7 [Функция уровня модуля.] => seed
# FUNC 7 [Функция уровня модуля.] => main
# CONST 4 [Константа или конфигурационное значение модуля.] => ROLES
# END_MODULE_MAP
# START_USE_CASES:
#- [seed]: Developer (Local Setup) -> ExecuteSeed -> ResultPrepared
#- [main]: Developer (Local Setup) -> ExecuteMain -> ResultPrepared
# END_USE_CASES
*/

import { PrismaClient } from "@prisma/client";

const ROLES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "runner", name: "Runner" },
  { code: "admin", name: "Admin" },
  { code: "partner", name: "Partner" },
];

// START_FUNCTION_seed
/*
# START_CONTRACT:
# PURPOSE: Создает новую сущность или запись домена database.
# INPUTS:
# - [Входной параметр seed.] => prisma: PrismaClient
# OUTPUTS:
# - [Promise<void>] - [Возвращаемое значение операции seed.]
# SIDE_EFFECTS:
# - Читает или изменяет данные через Prisma.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция seed завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу Promise<void>.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): database; LAYER(7): Seed; TYPE(6): Function]
# LINKS: [CALLS(7): transaction; CALLS(7): async; CALLS(7): upsert; CALLS(7): log]
# END_CONTRACT
*/
async function seed(prisma: PrismaClient): Promise<void> {
  // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
  await prisma.$transaction(async (tx) => {
    for (const role of ROLES) {
      await tx.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: role,
      });
    }
  });
  console.log(`[seed] roles ensured: ${ROLES.map((r) => r.code).join(", ")}`);
  // END_BLOCK_ACCESS_DATA_STORE

  // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
  const rawAdminEmail = process.env.SEED_ADMIN_EMAIL;
  if (!rawAdminEmail || rawAdminEmail.trim().length === 0) return;
  // END_BLOCK_VALIDATE_CONDITIONS

  // START_BLOCK_ACCESS_DATA_STORE_02: [Выполняет операции чтения или записи в хранилище данных.]
  const adminEmail = rawAdminEmail.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    console.warn(
      `[seed] SEED_ADMIN_EMAIL=${adminEmail} has no matching user; skipping admin promotion. ` +
        `Log in with this email via the magic-link flow first, then re-run the seed.`,
    );
    return;
  }
  // END_BLOCK_ACCESS_DATA_STORE_02

  // START_BLOCK_ACCESS_DATA_STORE_03: [Выполняет операции чтения или записи в хранилище данных.]
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: "admin" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    update: {},
    create: { userId: user.id, roleId: adminRole.id },
  });
  console.log(`[seed] promoted ${adminEmail} to admin`);
  // END_BLOCK_ACCESS_DATA_STORE_03
}
// END_FUNCTION_seed


// START_FUNCTION_main
/*
# START_CONTRACT:
# PURPOSE: Выполняет операцию main в домене database.
# OUTPUTS:
# - [Promise<void>] - [Возвращаемое значение операции main.]
# SIDE_EFFECTS:
# - Читает или изменяет данные через Prisma.
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция main завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу Promise<void>.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): database; LAYER(7): Seed; TYPE(6): Function]
# LINKS: [CALLS(7): PrismaClient; CALLS(7): seed; CALLS(7): disconnect]
# END_CONTRACT
*/
async function main(): Promise<void> {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  const prisma = new PrismaClient();
  try {
    await seed(prisma);
  } finally {
    await prisma.$disconnect();
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_main


main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
