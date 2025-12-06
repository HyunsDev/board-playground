import { ErrorHttpStatusCode, HTTPStatusCode, SuccessfulHttpStatusCode } from '@ts-rest/core';

import { ApiError } from './api-error.type';

export type ApiResponse<S extends HTTPStatusCode = HTTPStatusCode> =
  S extends SuccessfulHttpStatusCode
    ? ApiOkResponse<S>
    : S extends ErrorHttpStatusCode
      ? ApiErrResponse<S, string>
      : ApiOkResponse<SuccessfulHttpStatusCode> | ApiErrResponse<ErrorHttpStatusCode, string>;

export interface ApiOkResponse<S = SuccessfulHttpStatusCode, T = any> {
  status: S;
  body: T;
}

export interface ApiErrResponse<
  S extends ErrorHttpStatusCode = ErrorHttpStatusCode,
  C extends string = string,
  E = ApiError<S, C>,
> {
  status: S;
  body: E;
}
