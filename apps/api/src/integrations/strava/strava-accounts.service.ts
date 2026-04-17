/*
# FILE: apps/api/src/integrations/strava/strava-accounts.service.ts
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
# CLASS 9 [Основной класс модуля.] => StravaAccountsService
# METHOD 7 [Метод класса StravaAccountsService.] => constructor
# METHOD 7 [Метод класса StravaAccountsService.] => upsertFromTokenResponse
# METHOD 7 [Метод класса StravaAccountsService.] => findActive
# METHOD 7 [Метод класса StravaAccountsService.] => disconnect
# METHOD 7 [Метод класса StravaAccountsService.] => getFreshAccessToken
# METHOD 7 [Метод класса StravaAccountsService.] => safeDecrypt
# METHOD 7 [Метод класса StravaAccountsService.] => fetchAthleteId
# CONST 4 [Константа или конфигурационное значение модуля.] => REFRESH_SKEW_SECONDS
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaAccountsService.upsertFromTokenResponse]: Application Service (Business Flow) -> ExecuteUpsertFromTokenResponse -> BusinessResultPrepared
#- [StravaAccountsService.findActive]: Application Service (Business Flow) -> ExecuteFindActive -> BusinessResultPrepared
#- [StravaAccountsService.disconnect]: Application Service (Business Flow) -> ExecuteDisconnect -> BusinessResultPrepared
#- [StravaAccountsService.getFreshAccessToken]: Application Service (Business Flow) -> ExecuteGetFreshAccessToken -> BusinessResultPrepared
# END_USE_CASES
*/

import { Injectable, NotFoundException } from "@nestjs/common";
import { SyncProvider, UserProviderAccount } from "@prisma/client";
import { CryptoService } from "../../crypto/crypto.service";
import { PrismaService } from "../../prisma/prisma.service";
import { StravaApiClient } from "./strava-api.client";
import { StravaOAuthService } from "./strava-oauth.service";
import type { StravaTokenResponse } from "./types";

const REFRESH_SKEW_SECONDS = 120;

// START_CLASS_StravaAccountsService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaAccountsService.] => prisma: PrismaService
# - [Атрибут класса StravaAccountsService.] => crypto: CryptoService
# - [Атрибут класса StravaAccountsService.] => oauth: StravaOAuthService
# - [Атрибут класса StravaAccountsService.] => api: StravaApiClient
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Обновляет состояние или данные домена strava.] => upsertFromTokenResponse()
# - [Получает данные домена strava по заданным условиям.] => findActive()
# - [Выполняет операцию disconnect в домене strava.] => disconnect()
# - [Получает данные домена strava по заданным условиям.] => getFreshAccessToken()
# - [Выполняет операцию safeDecrypt в домене strava.] => safeDecrypt()
# - [Выполняет операцию fetchAthleteId в домене strava.] => fetchAthleteId()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class StravaAccountsService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly oauth: StravaOAuthService,
    private readonly api: StravaApiClient,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_upsertFromTokenResponse
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет состояние или данные домена strava.
  # INPUTS:
  # - [Входной параметр upsertFromTokenResponse.] => userId: string
  # - [Входной параметр upsertFromTokenResponse.] => tokens: StravaTokenResponse
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция upsertFromTokenResponse завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): crypto.encrypt; CALLS(7): prisma.userProviderAccount.upsert; CALLS(7): fetchAthleteId; CALLS(7): encrypt]
  # END_CONTRACT
  */
  async upsertFromTokenResponse(userId: string, tokens: StravaTokenResponse) {
    // START_BLOCK_PREPARE_CONTEXT: [Подготавливает исходные данные и локальный контекст выполнения.]
    const providerUserId = tokens.athlete?.id
      ? String(tokens.athlete.id)
      : await this.fetchAthleteId(tokens.access_token);
    // END_BLOCK_PREPARE_CONTEXT

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const data = {
      provider: SyncProvider.strava,
      providerUserId,
      accessTokenEncrypted: this.crypto.encrypt(tokens.access_token),
      refreshTokenEncrypted: this.crypto.encrypt(tokens.refresh_token),
      tokenExpiresAt: new Date(tokens.expires_at * 1000),
      scope: tokens.scope ?? null,
      disconnectedAt: null,
    };
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return this.prisma.userProviderAccount.upsert({
      where: { userId_provider: { userId, provider: SyncProvider.strava } },
      create: { userId, connectedAt: new Date(), ...data },
      update: { ...data, connectedAt: new Date() },
    });
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_upsertFromTokenResponse


  
  // START_METHOD_findActive
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена strava по заданным условиям.
  # INPUTS:
  # - [Входной параметр findActive.] => userId: string
  # OUTPUTS:
  # - [Promise<UserProviderAccount | null>] - [Возвращаемое значение операции findActive.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция findActive завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<UserProviderAccount | null>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): prisma.userProviderAccount.findFirst; CALLS(7): findFirst]
  # END_CONTRACT
  */
  findActive(userId: string): Promise<UserProviderAccount | null> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.prisma.userProviderAccount.findFirst({
      where: { userId, provider: SyncProvider.strava, disconnectedAt: null },
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_findActive


  
  // START_METHOD_disconnect
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию disconnect в домене strava.
  # INPUTS:
  # - [Входной параметр disconnect.] => userId: string
  # OUTPUTS:
  # - [Promise<void>] - [Возвращаемое значение операции disconnect.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция disconnect завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<void>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): api.deauthorize; CALLS(7): prisma.userProviderAccount.update; CALLS(7): findActive; CALLS(7): safeDecrypt]
  # END_CONTRACT
  */
  async disconnect(userId: string): Promise<void> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const account = await this.findActive(userId);
    if (!account) return;
    const accessToken = this.safeDecrypt(account.accessTokenEncrypted);
    if (accessToken) {
      await this.api.deauthorize(accessToken);
    }
    await this.prisma.userProviderAccount.update({
      where: { id: account.id },
      data: {
        disconnectedAt: new Date(),
        accessTokenEncrypted: null,
        refreshTokenEncrypted: null,
        tokenExpiresAt: null,
        scope: null,
      },
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_disconnect


  
  // START_METHOD_getFreshAccessToken
  /*
  # START_CONTRACT:
  # PURPOSE: Получает данные домена strava по заданным условиям.
  # INPUTS:
  # - [Входной параметр getFreshAccessToken.] => userId: string
  # OUTPUTS:
  # - [Promise<string>] - [Возвращаемое значение операции getFreshAccessToken.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция getFreshAccessToken завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<string>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): crypto.decrypt; CALLS(7): oauth.refreshToken; CALLS(7): prisma.userProviderAccount.update; CALLS(7): crypto.encrypt]
  # END_CONTRACT
  */
  async getFreshAccessToken(userId: string): Promise<string> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const account = await this.findActive(userId);
    if (!account || !account.accessTokenEncrypted || !account.refreshTokenEncrypted) {
      throw new NotFoundException({ code: "STRAVA_NOT_CONNECTED" });
    }
    const expiresAt = account.tokenExpiresAt?.getTime() ?? 0;
    const now = Date.now();
    if (expiresAt > now + REFRESH_SKEW_SECONDS * 1000) {
      return this.crypto.decrypt(account.accessTokenEncrypted);
    }
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    const refreshToken = this.crypto.decrypt(account.refreshTokenEncrypted);
    const tokens = await this.oauth.refreshToken(refreshToken);
    await this.prisma.userProviderAccount.update({
      where: { id: account.id },
      data: {
        accessTokenEncrypted: this.crypto.encrypt(tokens.access_token),
        refreshTokenEncrypted: this.crypto.encrypt(tokens.refresh_token),
        tokenExpiresAt: new Date(tokens.expires_at * 1000),
        scope: tokens.scope ?? account.scope,
      },
    });
    return tokens.access_token;
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_getFreshAccessToken


  
  // START_METHOD_safeDecrypt
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию safeDecrypt в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private safeDecrypt(payload: string | null): string | null {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    if (!payload) return null;
    try {
      return this.crypto.decrypt(payload);
    } catch {
      return null;
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_safeDecrypt


  
  // START_METHOD_fetchAthleteId
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию fetchAthleteId в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private async fetchAthleteId(accessToken: string): Promise<string> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const athlete = await this.api.getAthlete(accessToken);
    return String(athlete.id);
    // END_BLOCK_MAIN
  }
  // END_METHOD_fetchAthleteId

}
// END_CLASS_StravaAccountsService
