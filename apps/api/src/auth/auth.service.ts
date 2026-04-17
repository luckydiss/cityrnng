/*
# FILE: apps/api/src/auth/auth.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена auth.
# SCOPE: Service layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AuthService
# METHOD 7 [Метод класса AuthService.] => constructor
# METHOD 7 [Метод класса AuthService.] => requestLogin
# METHOD 7 [Метод класса AuthService.] => verifyLogin
# TYPE 5 [Тип или интерфейс прикладного контракта.] => RequestLoginResult
# TYPE 5 [Тип или интерфейс прикладного контракта.] => VerifyLoginResult
# END_MODULE_MAP
# START_USE_CASES:
#- [AuthService.requestLogin]: Application Service (Business Flow) -> ExecuteRequestLogin -> BusinessResultPrepared
#- [AuthService.verifyLogin]: Application Service (Business Flow) -> ExecuteVerifyLogin -> BusinessResultPrepared
# END_USE_CASES
*/

import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService, rolesOf } from "../users/users.service";
import { LoginChallengeService } from "./login-challenge.service";
import { TokensService } from "./tokens.service";
import type { Env } from "../config/env.schema";

export interface RequestLoginResult {
  ok: true;
  expiresAt: Date;
  devToken?: string;
}

export interface VerifyLoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

// START_CLASS_AuthService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена auth.
# ATTRIBUTES:
# - [Атрибут класса AuthService.] => logger: unknown
# - [Атрибут класса AuthService.] => prisma: PrismaService
# - [Атрибут класса AuthService.] => users: UsersService
# - [Атрибут класса AuthService.] => challenges: LoginChallengeService
# - [Атрибут класса AuthService.] => tokens: TokensService
# - [Атрибут класса AuthService.] => config: ConfigService<Env
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Создает challenge для входа пользователя по email.] => requestLogin()
# - [Проверяет токен входа, создает сессию и выдает access и refresh token.] => verifyLogin()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly challenges: LoginChallengeService,
    private readonly tokens: TokensService,
    private readonly config: ConfigService<Env, true>,
  ) {  }
  // END_METHOD_constructor


  
  
  // START_METHOD_requestLogin
  /*
  # START_CONTRACT:
  # PURPOSE: Создает challenge для входа пользователя по email.
  # INPUTS:
  # - [Входной параметр requestLogin.] => email: string
  # OUTPUTS:
  # - [Promise<RequestLoginResult>] - [Возвращаемое значение операции requestLogin.]
  # SIDE_EFFECTS:
  # - Записывает диагностические сообщения в лог.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция requestLogin завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<RequestLoginResult>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): challenges.issue; CALLS(7): logger.log; CALLS(7): config.get; CALLS(7): issue]
  # END_CONTRACT
  */
  async requestLogin(email: string): Promise<RequestLoginResult> {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const { token, expiresAt } = await this.challenges.issue(email);
    this.logger.log(`Login challenge issued for ${email}: ${token} (expires ${expiresAt.toISOString()})`);
    const exposeToken = this.config.get("AUTH_DEV_RETURN_TOKEN", { infer: true });
    return exposeToken ? { ok: true, expiresAt, devToken: token } : { ok: true, expiresAt };
    // END_BLOCK_MAIN
  }
  // END_METHOD_requestLogin


  
  
  // START_METHOD_verifyLogin
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет токен входа, создает сессию и выдает access и refresh token.
  # INPUTS:
  # - [Входной параметр verifyLogin.] => token: string
  # - [Входной параметр verifyLogin.] => meta: { userAgent?: string; ipAddress?: string }
  # OUTPUTS:
  # - [Promise<VerifyLoginResult>] - [Возвращаемое значение операции verifyLogin.]
  # SIDE_EFFECTS:
  # - Читает или изменяет данные через Prisma.
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция verifyLogin завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу Promise<VerifyLoginResult>.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): challenges.consume; CALLS(7): users.ensureFromVerifiedEmail; CALLS(7): tokens.issue; CALLS(7): prisma.session.create]
  # END_CONTRACT
  */
  async verifyLogin(
    token: string,
    meta: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<VerifyLoginResult> {
    // START_BLOCK_VALIDATE_CONDITIONS: [Проверяет условия выполнения и обрабатывает ранние выходы.]
    const consumed = await this.challenges.consume(token);
    if (!consumed) {
      throw new UnauthorizedException({ code: "AUTH_INVALID_TOKEN" });
    }
    // END_BLOCK_VALIDATE_CONDITIONS

    // START_BLOCK_EXECUTE_MAIN_FLOW: [Исполняет основную бизнес-логику блока.]
    const user = await this.users.ensureFromVerifiedEmail(consumed.email);
    const roles = rolesOf(user);
    const issued = await this.tokens.issue({ id: user.id, email: user.email, roles });
    // END_BLOCK_EXECUTE_MAIN_FLOW

    // START_BLOCK_ACCESS_DATA_STORE: [Выполняет операции чтения или записи в хранилище данных.]
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: issued.refreshTokenHash,
        expiresAt: issued.refreshTokenExpiresAt,
        userAgent: meta.userAgent ?? null,
        ipAddress: meta.ipAddress ?? null,
      },
    });
    // END_BLOCK_ACCESS_DATA_STORE

    // START_BLOCK_PREPARE_RESULT: [Формирует и возвращает итоговый результат.]
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      user: { id: user.id, email: user.email, roles },
    };
    // END_BLOCK_PREPARE_RESULT
  }
  // END_METHOD_verifyLogin


}
// END_CLASS_AuthService
