/*
# FILE: apps/api/src/integrations/strava/strava-activities.service.ts
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
# CLASS 9 [Основной класс модуля.] => StravaActivitiesService
# METHOD 7 [Метод класса StravaActivitiesService.] => constructor
# METHOD 7 [Метод класса StravaActivitiesService.] => listForUser
# TYPE 5 [Тип или интерфейс прикладного контракта.] => ListActivitiesOptions
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaActivitiesService.listForUser]: Application Service (Business Flow) -> ExecuteListForUser -> BusinessResultPrepared
# END_USE_CASES
*/

import { Injectable } from "@nestjs/common";
import { StravaAccountsService } from "./strava-accounts.service";
import { StravaApiClient } from "./strava-api.client";
import type { StravaActivity } from "./types";

export interface ListActivitiesOptions {
  after?: Date;
  before?: Date;
  page?: number;
  perPage?: number;
}

/**
 * Read-only foundation for fetching Strava activities.
 * Intentionally does NOT persist anything yet — ingestion lands in a later PR.
 */

// START_CLASS_StravaActivitiesService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaActivitiesService.] => accounts: StravaAccountsService
# - [Атрибут класса StravaActivitiesService.] => api: StravaApiClient
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Возвращает список сущностей или записей домена strava.] => listForUser()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class StravaActivitiesService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly accounts: StravaAccountsService,
    private readonly api: StravaApiClient,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_listForUser
  /*
  # START_CONTRACT:
  # PURPOSE: Возвращает список сущностей или записей домена strava.
  # INPUTS:
  # - [Входной параметр listForUser.] => userId: string
  # - [Входной параметр listForUser.] => options: ListActivitiesOptions
  # OUTPUTS:
  # - [Promise<StravaActivity[]>] - [Возвращаемое значение операции listForUser.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция listForUser завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<StravaActivity[]>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): accounts.getFreshAccessToken; CALLS(7): api.listActivities; CALLS(7): getFreshAccessToken; CALLS(7): listActivities]
  # END_CONTRACT
  */
  async listForUser(userId: string, options: ListActivitiesOptions = {}): Promise<StravaActivity[]> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const accessToken = await this.accounts.getFreshAccessToken(userId);
    return this.api.listActivities({
      accessToken,
      after: options.after ? Math.floor(options.after.getTime() / 1000) : undefined,
      before: options.before ? Math.floor(options.before.getTime() / 1000) : undefined,
      page: options.page,
      perPage: options.perPage,
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_listForUser

}
// END_CLASS_StravaActivitiesService
