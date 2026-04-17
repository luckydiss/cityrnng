/*
# FILE: apps/api/src/integrations/strava/strava-api.client.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Инкапсулирует взаимодействие с внешним API домена strava.
# SCOPE: Client layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => StravaApiClient
# METHOD 7 [Метод класса StravaApiClient.] => constructor
# METHOD 7 [Метод класса StravaApiClient.] => exchangeCode
# METHOD 7 [Метод класса StravaApiClient.] => refreshToken
# METHOD 7 [Метод класса StravaApiClient.] => deauthorize
# METHOD 7 [Метод класса StravaApiClient.] => getAthlete
# METHOD 7 [Метод класса StravaApiClient.] => listActivities
# METHOD 7 [Метод класса StravaApiClient.] => postForm
# METHOD 7 [Метод класса StravaApiClient.] => getJson
# FUNC 7 [Функция уровня модуля.] => safeText
# TYPE 5 [Тип или интерфейс прикладного контракта.] => TokenExchangeParams
# TYPE 5 [Тип или интерфейс прикладного контракта.] => TokenRefreshParams
# TYPE 5 [Тип или интерфейс прикладного контракта.] => ListActivitiesParams
# CONST 4 [Константа или конфигурационное значение модуля.] => STRAVA_BASE
# CONST 4 [Константа или конфигурационное значение модуля.] => STRAVA_OAUTH_BASE
# CONST 4 [Константа или конфигурационное значение модуля.] => USER_AGENT
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaApiClient.exchangeCode]: Integration Workflow -> ExecuteExchangeCode -> BusinessResultPrepared
#- [StravaApiClient.refreshToken]: Integration Workflow -> ExecuteRefreshToken -> BusinessResultPrepared
#- [StravaApiClient.deauthorize]: Integration Workflow -> ExecuteDeauthorize -> BusinessResultPrepared
#- [StravaApiClient.getAthlete]: Integration Workflow -> ExecuteGetAthlete -> BusinessResultPrepared
#- [StravaApiClient.listActivities]: Integration Workflow -> ExecuteListActivities -> BusinessResultPrepared
#- [safeText]: Integration Workflow -> ExecuteSafeText -> ResultPrepared
# END_USE_CASES
*/

import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../config/env.schema";
import type { StravaActivity, StravaAthlete, StravaTokenResponse } from "./types";

const STRAVA_BASE = "https://www.strava.com/api/v3";
const STRAVA_OAUTH_BASE = "https://www.strava.com";
const USER_AGENT = "CityRNNG/1.0 (+https://cityrnng.app)";

export interface TokenExchangeParams {
  code: string;
}

export interface TokenRefreshParams {
  refreshToken: string;
}

export interface ListActivitiesParams {
  accessToken: string;
  after?: number;
  before?: number;
  page?: number;
  perPage?: number;
}

// START_CLASS_StravaApiClient
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует взаимодействие с внешним API домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaApiClient.] => logger: unknown
# - [Атрибут класса StravaApiClient.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Обменивает OAuth code на токены Strava.] => exchangeCode()
# - [Обновляет токены Strava по refresh token.] => refreshToken()
# - [Отзывает авторизацию Strava для access token пользователя.] => deauthorize()
# - [Запрашивает профиль спортсмена в Strava.] => getAthlete()
# - [Запрашивает список активностей пользователя в Strava.] => listActivities()
# - [Отправляет form-urlencoded запрос во внешний API.] => postForm()
# - [Выполняет GET-запрос и возвращает JSON-ответ внешнего API.] => getJson()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class StravaApiClient {
  private readonly logger = new Logger(StravaApiClient.name);

  
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly config: ConfigService<Env, true>) {  }
  // END_METHOD_constructor


  
  
  // START_METHOD_exchangeCode
  /*
  # START_CONTRACT:
  # PURPOSE: Обменивает OAuth code на токены Strava.
  # INPUTS:
  # - [Входной параметр exchangeCode.] => { code }: TokenExchangeParams
  # OUTPUTS:
  # - [Promise<StravaTokenResponse>] - [Возвращаемое значение операции exchangeCode.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция exchangeCode завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<StravaTokenResponse>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): config.get; CALLS(7): get]
  # END_CONTRACT
  */
  async exchangeCode({ code }: TokenExchangeParams): Promise<StravaTokenResponse> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const body = new URLSearchParams({
      client_id: this.config.get("STRAVA_CLIENT_ID", { infer: true }),
      client_secret: this.config.get("STRAVA_CLIENT_SECRET", { infer: true }),
      code,
      grant_type: "authorization_code",
    });
    return this.postForm<StravaTokenResponse>(`${STRAVA_OAUTH_BASE}/oauth/token`, body);
    // END_BLOCK_MAIN
  }
  // END_METHOD_exchangeCode


  
  
  // START_METHOD_refreshToken
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет токены Strava по refresh token.
  # INPUTS:
  # - [Входной параметр refreshToken.] => { refreshToken }: TokenRefreshParams
  # OUTPUTS:
  # - [Promise<StravaTokenResponse>] - [Возвращаемое значение операции refreshToken.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция refreshToken завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<StravaTokenResponse>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): config.get; CALLS(7): get]
  # END_CONTRACT
  */
  async refreshToken({ refreshToken }: TokenRefreshParams): Promise<StravaTokenResponse> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const body = new URLSearchParams({
      client_id: this.config.get("STRAVA_CLIENT_ID", { infer: true }),
      client_secret: this.config.get("STRAVA_CLIENT_SECRET", { infer: true }),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });
    return this.postForm<StravaTokenResponse>(`${STRAVA_OAUTH_BASE}/oauth/token`, body);
    // END_BLOCK_MAIN
  }
  // END_METHOD_refreshToken


  
  
  // START_METHOD_deauthorize
  /*
  # START_CONTRACT:
  # PURPOSE: Отзывает авторизацию Strava для access token пользователя.
  # INPUTS:
  # - [Входной параметр deauthorize.] => accessToken: string
  # OUTPUTS:
  # - [Promise<void>] - [Возвращаемое значение операции deauthorize.]
  # SIDE_EFFECTS:
  # - Вызывает внешний HTTP API.
  # - Записывает диагностические сообщения в лог.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция deauthorize завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<void>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): logger.warn; CALLS(7): fetch; CALLS(7): timeout; CALLS(7): warn]
  # END_CONTRACT
  */
  async deauthorize(accessToken: string): Promise<void> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    try {
      const res = await fetch(`${STRAVA_OAUTH_BASE}/oauth/deauthorize`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "user-agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        this.logger.warn(`Strava deauthorize returned ${res.status}`);
      }
    } catch (err) {
      this.logger.warn(`Strava deauthorize failed: ${(err as Error).message}`);
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_deauthorize


  
  
  // START_METHOD_getAthlete
  /*
  # START_CONTRACT:
  # PURPOSE: Запрашивает профиль спортсмена в Strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.getJson<StravaAthlete>(`${STRAVA_BASE}/athlete`, accessToken);
    // END_BLOCK_MAIN
  }
  // END_METHOD_getAthlete


  
  
  // START_METHOD_listActivities
  /*
  # START_CONTRACT:
  # PURPOSE: Запрашивает список активностей пользователя в Strava.
  # INPUTS:
  # - [Входной параметр listActivities.] => params: ListActivitiesParams
  # OUTPUTS:
  # - [Promise<StravaActivity[]>] - [Возвращаемое значение операции listActivities.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция listActivities завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<StravaActivity[]>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): set; CALLS(7): toString]
  # END_CONTRACT
  */
  async listActivities(params: ListActivitiesParams): Promise<StravaActivity[]> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const url = new URL(`${STRAVA_BASE}/athlete/activities`);
    if (params.after) url.searchParams.set("after", String(params.after));
    if (params.before) url.searchParams.set("before", String(params.before));
    if (params.page) url.searchParams.set("page", String(params.page));
    url.searchParams.set("per_page", String(params.perPage ?? 30));
    return this.getJson<StravaActivity[]>(url.toString(), params.accessToken);
    // END_BLOCK_MAIN
  }
  // END_METHOD_listActivities


  
  
  // START_METHOD_postForm
  /*
  # START_CONTRACT:
  # PURPOSE: Отправляет form-urlencoded запрос во внешний API.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private async postForm<T>(url: string, body: URLSearchParams): Promise<T> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "application/json",
        "user-agent": USER_AGENT,
      },
      body,
    });
    if (!res.ok) {
      const detail = await safeText(res);
      this.logger.error(`Strava POST ${url} failed ${res.status}: ${detail}`);
      throw new InternalServerErrorException({ code: "STRAVA_UPSTREAM_ERROR" });
    }
    return (await res.json()) as T;
    // END_BLOCK_MAIN
  }
  // END_METHOD_postForm


  
  
  // START_METHOD_getJson
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет GET-запрос и возвращает JSON-ответ внешнего API.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private async getJson<T>(url: string, accessToken: string): Promise<T> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const res = await fetch(url, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/json",
        "user-agent": USER_AGENT,
      },
    });
    if (!res.ok) {
      const detail = await safeText(res);
      this.logger.error(`Strava GET ${url} failed ${res.status}: ${detail}`);
      throw new InternalServerErrorException({ code: "STRAVA_UPSTREAM_ERROR" });
    }
    return (await res.json()) as T;
    // END_BLOCK_MAIN
  }
  // END_METHOD_getJson


}
// END_CLASS_StravaApiClient


// START_FUNCTION_safeText
/*
# START_CONTRACT:
# PURPOSE: Безопасно читает текст ответа для диагностики ошибок.
# INPUTS:
# - [Входной параметр safeText.] => res: Response
# OUTPUTS:
# - [Promise<string>] - [Возвращаемое значение операции safeText.]
# TEST_CONDITIONS_SUCCESS_CRITERIA:
# - Операция safeText завершает основной сценарий без нарушения ожидаемого контракта.
# - Возвращаемое значение соответствует типу Promise<string>.
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Client; TYPE(6): Function]
# LINKS: [CALLS(7): text; CALLS(7): slice]
# END_CONTRACT
*/
async function safeText(res: Response): Promise<string> {
  // START_BLOCK_MAIN: [Основной поток выполнения.]
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return "<unreadable body>";
  }
  // END_BLOCK_MAIN
}
// END_FUNCTION_safeText
