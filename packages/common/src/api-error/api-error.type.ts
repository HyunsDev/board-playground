import { type ErrorHttpStatusCode } from '@ts-rest/core';

/**
 * 서버가 클라이언트에게 반환하는 표준 API 오류 형식입니다.
 *
 * @template S - HTTP 상태 코드 (ErrorHttpStatusCode)
 * @template C - 오류 코드 (string)
 * @template T - 추가 세부 정보의 타입 (기본값: any)
 *
 * @example
 * ```ts
 * const apiError: ApiError = {
 *   status: 404,
 *   code: 'USER_NOT_FOUND',
 *   message: 'The requested user was not found.',
 * };
 * ```
 */
export interface ApiError<
  S extends ErrorHttpStatusCode = ErrorHttpStatusCode,
  C extends string = string,
  T = unknown,
> {
  status: S;
  code: C;
  message: string;
  details?: T;
}
