import { type ApiError } from './api-error.type';

import type { ErrorHttpStatusCode, HTTPStatusCode, SuccessfulHttpStatusCode } from '@ts-rest/core';

/**
 * 서버가 클라이언트에게 반환하는 표준 API 성공 응답 형식입니다.
 *
 * @param S - HTTP 성공 상태 코드 ({@link SuccessfulHttpStatusCode})
 */
export interface ApiOkResponse<S = SuccessfulHttpStatusCode, T = any> {
  status: S;
  body: T;
}

/**
 * 서버가 클라이언트에게 반환하는 표준 API 오류 응답 형식입니다. 오류 본문은 {@link ApiError} 형식을 따릅니다.
 * @param S - HTTP 실패 상태 코드 ({@link ErrorHttpStatusCode})
 * @param C - 오류 코드 (string)
 * @param E - 오류 형식 (기본값: ApiError<S, C>)
 */
export interface ApiErrResponse<
  S extends ErrorHttpStatusCode = ErrorHttpStatusCode,
  C extends string = string,
  E = ApiError<S, C>,
> {
  status: S;
  body: E;
}

/**
 * 서버가 클라이언트에게 반환하는 표준 API 응답 형식입니다. 성공 응답과 오류 응답을 모두 포함할 수 있습니다.
 * @param S - HTTP 상태 코드 ({@link HTTPStatusCode})
 */
export type ApiResponse<S extends HTTPStatusCode = HTTPStatusCode> =
  S extends SuccessfulHttpStatusCode
    ? ApiOkResponse<S>
    : S extends ErrorHttpStatusCode
      ? ApiErrResponse<S, string>
      : ApiOkResponse<SuccessfulHttpStatusCode> | ApiErrResponse<ErrorHttpStatusCode, string>;
