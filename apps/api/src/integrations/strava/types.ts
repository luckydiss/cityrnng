/*
# FILE: apps/api/src/integrations/strava/types.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Содержит общие типы и контракты домена strava.
# SCOPE: Types layer for domain strava inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): strava; LAYER(7): Types; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# TYPE 5 [Тип или интерфейс прикладного контракта.] => StravaTokenResponse
# TYPE 5 [Тип или интерфейс прикладного контракта.] => StravaAthlete
# TYPE 5 [Тип или интерфейс прикладного контракта.] => StravaActivity
# TYPE 5 [Тип или интерфейс прикладного контракта.] => StateClaims
# END_MODULE_MAP
# START_USE_CASES:
#- [types]: Application Layer -> SupportRuntimeConfiguration -> ContextPrepared
# END_USE_CASES
*/

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: "Bearer";
  scope?: string;
  athlete?: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  city?: string | null;
  country?: string | null;
  profile?: string | null;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  start_date: string;
  start_date_local: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  start_latlng?: [number, number] | null;
  end_latlng?: [number, number] | null;
}

export interface StateClaims {
  sub: string;
  kind: "strava_oauth";
  nonce: string;
}
