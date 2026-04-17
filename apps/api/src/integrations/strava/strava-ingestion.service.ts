/*
# FILE: apps/api/src/integrations/strava/strava-ingestion.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена strava.
# SCOPE: Service layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => StravaIngestionService
# METHOD 7 [Метод класса StravaIngestionService.] => constructor
# METHOD 7 [Метод класса StravaIngestionService.] => ingestForUser
# METHOD 7 [Метод класса StravaIngestionService.] => toRow
# TYPE 5 [Тип или интерфейс прикладного контракта.] => IngestOptions
# TYPE 5 [Тип или интерфейс прикладного контракта.] => IngestSummary
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaIngestionService.ingestForUser]: Application Service (Business Flow) -> ExecuteIngestForUser -> BusinessResultPrepared
# END_USE_CASES
*/

import { Injectable, NotFoundException } from "@nestjs/common";
import { SyncProvider } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StravaAccountsService } from "./strava-accounts.service";
import { StravaActivitiesService } from "./strava-activities.service";
import type { StravaActivity } from "./types";

export interface IngestOptions {
  after?: Date;
  before?: Date;
  perPage?: number;
  pageLimit?: number;
}

export interface IngestSummary {
  fetched: number;
  upserted: number;
  pages: number;
}

// START_CLASS_StravaIngestionService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaIngestionService.] => prisma: PrismaService
# - [Атрибут класса StravaIngestionService.] => accounts: StravaAccountsService
# - [Атрибут класса StravaIngestionService.] => activities: StravaActivitiesService
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Выполняет операцию ingestForUser в домене strava.] => ingestForUser()
# - [Выполняет операцию toRow в домене strava.] => toRow()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class StravaIngestionService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: StravaAccountsService,
    private readonly activities: StravaActivitiesService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_ingestForUser
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию ingestForUser в домене strava.
  # INPUTS:
  # - [Входной параметр ingestForUser.] => userId: string
  # - [Входной параметр ingestForUser.] => options: IngestOptions
  # OUTPUTS:
  # - [Promise<IngestSummary>] - [Возвращаемое значение операции ingestForUser.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция ingestForUser завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<IngestSummary>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): accounts.findActive; CALLS(7): activities.listForUser; CALLS(7): prisma.externalActivity.upsert; CALLS(7): findActive]
  # END_CONTRACT
  */
  async ingestForUser(userId: string, options: IngestOptions = {}): Promise<IngestSummary> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const account = await this.accounts.findActive(userId);
    if (!account) throw new NotFoundException({ code: "STRAVA_NOT_CONNECTED" });
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const perPage = options.perPage ?? 50;
    const pageLimit = options.pageLimit ?? 5;
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_EXECUTE_MAIN_FLOW_02: [Исполняет основную бизнес-логику блока.]
    let fetched = 0;
    let upserted = 0;
    let pages = 0;
    // END_BLOCK_EXECUTE_MAIN_FLOW_02

    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    for (let page = 1; page <= pageLimit; page++) {
      const batch = await this.activities.listForUser(userId, {
        after: options.after,
        before: options.before,
        page,
        perPage,
      });
      pages = page;
      if (batch.length === 0) break;
      fetched += batch.length;

      for (const activity of batch) {
        const row = this.toRow(activity);
        if (!row) continue;
        await this.prisma.externalActivity.upsert({
          where: { provider_externalId: { provider: SyncProvider.strava, externalId: row.externalId } },
          create: {
            ...row,
            userId,
            provider: SyncProvider.strava,
            userProviderAccountId: account.id,
          },
          update: {
            activityType: row.activityType,
            startedAt: row.startedAt,
            elapsedSeconds: row.elapsedSeconds,
            distanceMeters: row.distanceMeters,
            startLat: row.startLat,
            startLng: row.startLng,
            endLat: row.endLat,
            endLng: row.endLng,
            payloadJson: row.payloadJson,
          },
        });
        upserted += 1;
      }

      if (batch.length < perPage) break;
    }
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return { fetched, upserted, pages };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_ingestForUser


  
  // START_METHOD_toRow
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию toRow в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private toRow(activity: StravaActivity) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    if (!activity?.id || !activity.start_date) return null;
    const [startLat, startLng] = activity.start_latlng ?? [null, null];
    const [endLat, endLng] = activity.end_latlng ?? [null, null];
    return {
      externalId: String(activity.id),
      activityType: activity.sport_type ?? activity.type ?? null,
      startedAt: new Date(activity.start_date),
      elapsedSeconds: Math.max(0, Math.round(activity.elapsed_time ?? 0)),
      distanceMeters: Math.max(0, Math.round(activity.distance ?? 0)),
      startLat: startLat ?? null,
      startLng: startLng ?? null,
      endLat: endLat ?? null,
      endLng: endLng ?? null,
      payloadJson: activity as unknown as object,
    };
    // END_BLOCK_MAIN
  }
  // END_METHOD_toRow

}
// END_CLASS_StravaIngestionService
