/*
# FILE: apps/api/src/auth/auth.controller.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена auth.
# SCOPE: Controller layer for domain auth inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Controller; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => AuthController
# METHOD 7 [Метод класса AuthController.] => constructor
# METHOD 7 [Метод класса AuthController.] => requestLogin
# METHOD 7 [Метод класса AuthController.] => verifyLogin
# END_MODULE_MAP
# START_USE_CASES:
#- [AuthController.requestLogin]: API Client (HTTP Request) -> ExecuteRequestLogin -> BusinessResultPrepared
#- [AuthController.verifyLogin]: API Client (HTTP Request) -> ExecuteVerifyLogin -> BusinessResultPrepared
# END_USE_CASES
*/

import { Body, Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { RequestLoginDto } from "./dto/request-login.dto";
import { VerifyLoginDto } from "./dto/verify-login.dto";

// START_CLASS_AuthController
/*
# START_CONTRACT:
# PURPOSE: Определяет HTTP-контроллер и маршруты домена auth.
# ATTRIBUTES:
# - [Атрибут класса AuthController.] => auth: AuthService) {}
# METHODS:
# - [Выполняет операцию constructor в домене auth.] => constructor()
# - [Создает challenge для входа пользователя по email.] => requestLogin()
# - [Проверяет токен входа, создает сессию и выдает access и refresh token.] => verifyLogin()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Controller; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Controller("auth")
export class AuthController {
  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене auth.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(private readonly auth: AuthService) {}
  // END_METHOD_constructor


  
  // START_METHOD_requestLogin
  /*
  # START_CONTRACT:
  # PURPOSE: Создает challenge для входа пользователя по email.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Controller; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  @Public()
  @Post("request-login")
  @HttpCode(HttpStatus.ACCEPTED)
  requestLogin(@Body() dto: RequestLoginDto) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.auth.requestLogin(dto.email);
    // END_BLOCK_MAIN
  }
  // END_METHOD_requestLogin


  
  // START_METHOD_verifyLogin
  /*
  # START_CONTRACT:
  # PURPOSE: Проверяет токен входа, создает сессию и выдает access и refresh token.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция verifyLogin завершает основной сценарий без нарушения ожидаемого контракта.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): auth; LAYER(7): Controller; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): auth.verifyLogin; CALLS(7): verifyLogin]
  # END_CONTRACT
  */
  @Public()
  @Post("verify-login")
  @HttpCode(HttpStatus.OK)
  verifyLogin(@Body() dto: VerifyLoginDto, @Req() req: Request) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    return this.auth.verifyLogin(dto.token, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });
    // END_BLOCK_MAIN
  }
  // END_METHOD_verifyLogin

}
// END_CLASS_AuthController
