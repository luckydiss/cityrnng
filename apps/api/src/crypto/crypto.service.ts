/*
# FILE: apps/api/src/crypto/crypto.service.ts
# VERSION: legacy-annotated-2
# START_MODULE_CONTRACT:
# PURPOSE: Реализует бизнес-логику и координирует операции домена crypto.
# SCOPE: Service layer for domain crypto inside CITYRNNG.
# INPUT: Конфигурация окружения, DTO, доменные сущности и инфраструктурные зависимости по контексту файла.
# OUTPUT: Публичные API модуля, доменные результаты или вспомогательные типы, доступные остальной системе.
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Service; TYPE(6): Module]
# LINKS: [READS_SPEC(7): docs/PRD.md; READS_SPEC(7): docs/ARCHITECTURE.md; READS_SPEC(7): docs/API-CONTRACTS.md]
# LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
# END_MODULE_CONTRACT
# START_MODULE_MAP:
# CLASS 9 [Основной класс модуля.] => CryptoService
# METHOD 7 [Метод класса CryptoService.] => constructor
# METHOD 7 [Метод класса CryptoService.] => encrypt
# METHOD 7 [Метод класса CryptoService.] => decrypt
# CONST 4 [Константа или конфигурационное значение модуля.] => ALGO
# CONST 4 [Константа или конфигурационное значение модуля.] => IV_LEN
# CONST 4 [Константа или конфигурационное значение модуля.] => TAG_LEN
# CONST 4 [Константа или конфигурационное значение модуля.] => VERSION
# END_MODULE_MAP
# START_USE_CASES:
#- [CryptoService.encrypt]: Application Service (Business Flow) -> ExecuteEncrypt -> BusinessResultPrepared
#- [CryptoService.decrypt]: Application Service (Business Flow) -> ExecuteDecrypt -> BusinessResultPrepared
# END_USE_CASES
*/

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.schema";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const VERSION = "v1";

// START_CLASS_CryptoService
/*
# START_CONTRACT:
# PURPOSE: Инкапсулирует бизнес-логику и координирует операции домена crypto.
# ATTRIBUTES:
# - [Атрибут класса CryptoService.] => key: Buffer
# METHODS:
# - [Выполняет операцию constructor в домене crypto.] => constructor()
# - [Шифрует значение с использованием криптографического сервиса.] => encrypt()
# - [Расшифровывает ранее зашифрованное значение.] => decrypt()
# KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Service; TYPE(6): Class]
# LINKS: [IMPLEMENTS(6): module_workflow]
# END_CONTRACT
*/
@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  
  // START_METHOD_constructor
  /*
  # START_CONTRACT:
  # PURPOSE: Выполняет операцию constructor в домене crypto.
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Service; TYPE(6): ClassMethod]
  # END_CONTRACT
  */
  constructor(config: ConfigService<Env, true>) {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const keyB64: string = config.get("TOKEN_ENCRYPTION_KEY", { infer: true });
    this.key = Buffer.from(keyB64, "base64");
    // END_BLOCK_MAIN
  }
  // END_METHOD_constructor


  
  // START_METHOD_encrypt
  /*
  # START_CONTRACT:
  # PURPOSE: Шифрует значение с использованием криптографического сервиса.
  # INPUTS:
  # - [Входной параметр encrypt.] => plaintext: string
  # OUTPUTS:
  # - [string] - [Возвращаемое значение операции encrypt.]
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция encrypt завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу string.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): randomBytes; CALLS(7): createCipheriv; CALLS(7): concat; CALLS(7): update]
  # END_CONTRACT
  */
  encrypt(plaintext: string): string {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSION, iv.toString("base64"), tag.toString("base64"), ct.toString("base64")].join(":");
    // END_BLOCK_MAIN
  }
  // END_METHOD_encrypt


  
  // START_METHOD_decrypt
  /*
  # START_CONTRACT:
  # PURPOSE: Расшифровывает ранее зашифрованное значение.
  # INPUTS:
  # - [Входной параметр decrypt.] => payload: string
  # OUTPUTS:
  # - [string] - [Возвращаемое значение операции decrypt.]
  # SIDE_EFFECTS:
  # - Может завершиться исключением при нарушении условий выполнения.
  # TEST_CONDITIONS_SUCCESS_CRITERIA:
  # - Операция decrypt завершает основной сценарий без нарушения ожидаемого контракта.
  # - Возвращаемое значение соответствует типу string.
  # LINKS_TO_SPECIFICATION: [docs/PRD.md; docs/ARCHITECTURE.md; docs/API-CONTRACTS.md]
  # KEYWORDS: [PROJECT(9): CITYRNNG; DOMAIN(8): crypto; LAYER(7): Service; TYPE(6): ClassMethod]
  # LINKS: [CALLS(7): split; CALLS(7): Error; CALLS(7): from; CALLS(7): createDecipheriv]
  # END_CONTRACT
  */
  decrypt(payload: string): string {
    // START_BLOCK_MAIN: [Основной поток выполнения.]
    const [version, ivB64, tagB64, ctB64] = payload.split(":");
    if (version !== VERSION) {
      throw new Error(`Unsupported ciphertext version: ${version}`);
    }
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const ct = Buffer.from(ctB64, "base64");
    if (iv.length !== IV_LEN || tag.length !== TAG_LEN) {
      throw new Error("Invalid ciphertext envelope");
    }
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
    // END_BLOCK_MAIN
  }
  // END_METHOD_decrypt

}
// END_CLASS_CryptoService
