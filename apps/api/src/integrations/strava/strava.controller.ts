/*
# FILE: apps/api/src/integrations/strava/strava.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена strava.
# SCOPE: Controller layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => StravaController
# METHOD 7 [Метод класса StravaController.] => constructor
# METHOD 7 [Метод класса StravaController.] => connect
# METHOD 7 [Метод класса StravaController.] => callback
# METHOD 7 [Метод класса StravaController.] => status
# METHOD 7 [Метод класса StravaController.] => disconnect
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaController.connect]: API Client (HTTP Request) -> ExecuteConnect -> BusinessResultPrepared
#- [StravaController.callback]: API Client (HTTP Request) -> ExecuteCallback -> BusinessResultPrepared
#- [StravaController.status]: API Client (HTTP Request) -> ExecuteStatus -> BusinessResultPrepared
#- [StravaController.disconnect]: API Client (HTTP Request) -> ExecuteDisconnect -> BusinessResultPrepared
# END_USE_CASES
*/

import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Public } from "../../auth/decorators/public.decorator";
import type { AuthenticatedUser } from "../../auth/types";
import { StravaCallbackQuery } from "./dto/callback.query";
import { StravaAccountsService } from "./strava-accounts.service";
import { StravaOAuthService } from "./strava-oauth.service";

// START_CLASS_StravaController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaController.] => oauth: StravaOAuthService
# - [Атрибут класса StravaController.] => accounts: StravaAccountsService
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Выполняет операцию connect в домене strava.] => connect()
# - [Выполняет операцию callback в домене strava.] => callback()
# - [Выполняет операцию status в домене strava.] => status()
# - [Выполняет операцию disconnect в домене strava.] => disconnect()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("integrations/strava")
export class StravaController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly oauth: StravaOAuthService,
    private readonly accounts: StravaAccountsService,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_connect
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию connect в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Get("connect")
  async connect(@CurrentUser() user: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const authorizeUrl = await this.oauth.buildAuthorizeUrl(user.id);
    return { authorizeUrl };
    // END_BLOCK_MAIN
  }
  // END_METHOD_connect


  
  // START_METHOD_callback
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию callback в домене strava.
  # SIDE_EFFECTS:
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция callback завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): oauth.verifyState; CALLS(7): oauth.exchangeCode; CALLS(7): accounts.upsertFromTokenResponse; CALLS(7): BadRequestException]
  # END_CONTRACT
  */
  @Public()
  @Get("callback")
  async callback(@Query() query: StravaCallbackQuery) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    if (query.error) {
      throw new BadRequestException({ code: "STRAVA_AUTHORIZATION_DENIED", details: { error: query.error } });
    }
    if (!query.code) {
      throw new BadRequestException({ code: "STRAVA_CALLBACK_MISSING_CODE" });
    }
    const userId = await this.oauth.verifyState(query.state);
    const tokens = await this.oauth.exchangeCode(query.code);
    const account = await this.accounts.upsertFromTokenResponse(userId, tokens);
    return {
      connected: true,
      providerUserId: account.providerUserId,
      scope: account.scope,
    };
    // END_BLOCK_MAIN
  }
  // END_METHOD_callback


  
  // START_METHOD_status
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию status в домене strava.
  # INPUTS:
  # - [Входной параметр status.] => "status": unknown
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция status завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): accounts.findActive; CALLS(7): findActive]
  # END_CONTRACT
  */
  @Get("status")
  async status(@CurrentUser() user: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const account = await this.accounts.findActive(user.id);
    if (!account) return { connected: false };
    return {
      connected: true,
      providerUserId: account.providerUserId,
      scope: account.scope,
      connectedAt: account.connectedAt,
      tokenExpiresAt: account.tokenExpiresAt,
    };
    // END_BLOCK_MAIN
  }
  // END_METHOD_status


  
  // START_METHOD_disconnect
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию disconnect в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Delete("disconnect")
  @HttpCode(HttpStatus.NO_CONTENT)
  async disconnect(@CurrentUser() user: AuthenticatedUser) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    await this.accounts.disconnect(user.id);
    // END_BLOCK_MAIN
  }
  // END_METHOD_disconnect

}
// END_CLASS_StravaController
