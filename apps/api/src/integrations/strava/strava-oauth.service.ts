/*
# FILE: apps/api/src/integrations/strava/strava-oauth.service.ts
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
# CLASS 9 [Основной класс модуля.] => StravaOAuthService
# METHOD 7 [Метод класса StravaOAuthService.] => constructor
# METHOD 7 [Метод класса StravaOAuthService.] => buildAuthorizeUrl
# METHOD 7 [Метод класса StravaOAuthService.] => verifyState
# METHOD 7 [Метод класса StravaOAuthService.] => exchangeCode
# METHOD 7 [Метод класса StravaOAuthService.] => refreshToken
# METHOD 7 [Метод класса StravaOAuthService.] => provider
# METHOD 7 [Метод класса StravaOAuthService.] => stateSecret
# CONST 4 [Константа или конфигурационное значение модуля.] => STATE_TTL
# END_MODULE_MAP
# START_USE_CASES:
#- [StravaOAuthService.buildAuthorizeUrl]: Application Service (Business Flow) -> ExecuteBuildAuthorizeUrl -> BusinessResultPrepared
#- [StravaOAuthService.verifyState]: Application Service (Business Flow) -> ExecuteVerifyState -> BusinessResultPrepared
#- [StravaOAuthService.exchangeCode]: Application Service (Business Flow) -> ExecuteExchangeCode -> BusinessResultPrepared
#- [StravaOAuthService.refreshToken]: Application Service (Business Flow) -> ExecuteRefreshToken -> BusinessResultPrepared
#- [StravaOAuthService.provider]: Application Service (Business Flow) -> ExecuteProvider -> BusinessResultPrepared
# END_USE_CASES
*/

import { randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { SyncProvider } from "@prisma/client";
import type { Env } from "../../config/env.schema";
import { StravaApiClient } from "./strava-api.client";
import type { StateClaims, StravaTokenResponse } from "./types";

const STATE_TTL = "10m";

// START_CLASS_StravaOAuthService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена strava.
# ATTRIBUTES:
# - [Атрибут класса StravaOAuthService.] => config: ConfigService<Env
# - [Атрибут класса StravaOAuthService.] => jwt: JwtService
# - [Атрибут класса StravaOAuthService.] => api: StravaApiClient
# METHODS:
# - [Выполняет операцию constructor в домене strava.] => constructor()
# - [Выполняет операцию buildAuthorizeUrl в домене strava.] => buildAuthorizeUrl()
# - [Выполняет операцию verifyState в домене strava.] => verifyState()
# - [Обменивает OAuth code на токены Strava.] => exchangeCode()
# - [Обновляет токены Strava по refresh token.] => refreshToken()
# - [Выполняет операцию provider в домене strava.] => provider()
# - [Выполняет операцию stateSecret в домене strava.] => stateSecret()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class StravaOAuthService {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly jwt: JwtService,
    private readonly api: StravaApiClient,
  ) {}
  // END_METHOD_constructor


  
  // START_METHOD_buildAuthorizeUrl
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию buildAuthorizeUrl в домене strava.
  # INPUTS:
  # - [Входной параметр buildAuthorizeUrl.] => userId: string
  # OUTPUTS:
  # - [Promise<string>] - [Возвращаемое значение операции buildAuthorizeUrl.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция buildAuthorizeUrl завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<string>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): jwt.signAsync; CALLS(7): config.get; CALLS(7): signAsync; CALLS(7): randomBytes]
  # END_CONTRACT
  */
  async buildAuthorizeUrl(userId: string): Promise<string> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const state = await this.jwt.signAsync(
      { sub: userId, kind: "strava_oauth", nonce: randomBytes(16).toString("hex") } satisfies StateClaims,
      {
        secret: this.stateSecret(),
        expiresIn: STATE_TTL,
      },
    );
    const url = new URL("https://www.strava.com/oauth/authorize");
    url.searchParams.set("client_id", this.config.get("STRAVA_CLIENT_ID", { infer: true }));
    url.searchParams.set("redirect_uri", this.config.get("STRAVA_REDIRECT_URI", { infer: true }));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("approval_prompt", "auto");
    url.searchParams.set("scope", this.config.get("STRAVA_SCOPES", { infer: true }));
    url.searchParams.set("state", state);
    return url.toString();
    // END_BLOCK_MAIN
  }
  // END_METHOD_buildAuthorizeUrl


  
  // START_METHOD_verifyState
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию verifyState в домене strava.
  # INPUTS:
  # - [Входной параметр verifyState.] => state: string
  # OUTPUTS:
  # - [Promise<string>] - [Возвращаемое значение операции verifyState.]
  # SIDE_EFFECTS:
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция verifyState завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<string>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): stateSecret; CALLS(7): UnauthorizedException]
  # END_CONTRACT
  */
  async verifyState(state: string): Promise<string> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    try {
      const claims = await this.jwt.verifyAsync<StateClaims>(state, { secret: this.stateSecret() });
      if (claims.kind !== "strava_oauth") {
        throw new UnauthorizedException({ code: "STRAVA_STATE_INVALID" });
      }
      return claims.sub;
    } catch {
      throw new UnauthorizedException({ code: "STRAVA_STATE_INVALID" });
    }
    // END_BLOCK_MAIN
  }
  // END_METHOD_verifyState


  
  // START_METHOD_exchangeCode
  /*
  # START_CONTRACT:
  # PURPOSE: Обменивает OAuth code на токены Strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  exchangeCode(code: string): Promise<StravaTokenResponse> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.api.exchangeCode({ code });
    // END_BLOCK_MAIN
  }
  // END_METHOD_exchangeCode


  
  // START_METHOD_refreshToken
  /*
  # START_CONTRACT:
  # PURPOSE: Обновляет токены Strava по refresh token.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  refreshToken(refreshToken: string): Promise<StravaTokenResponse> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.api.refreshToken({ refreshToken });
    // END_BLOCK_MAIN
  }
  // END_METHOD_refreshToken


  
  // START_METHOD_provider
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию provider в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  get provider(): SyncProvider {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return SyncProvider.strava;
    // END_BLOCK_MAIN
  }
  // END_METHOD_provider


  
  // START_METHOD_stateSecret
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию stateSecret в домене strava.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  private stateSecret(): string {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    // Reuse access-token secret so we don't introduce another secret; state tokens are ephemeral.
    return this.config.get("JWT_ACCESS_SECRET", { infer: true });
    // END_BLOCK_MAIN
  }
  // END_METHOD_stateSecret

}
// END_CLASS_StravaOAuthService
