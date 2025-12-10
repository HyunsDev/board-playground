import { type ErrorHttpStatusCode } from '@ts-rest/core';

export interface ApiError<
  S extends ErrorHttpStatusCode = ErrorHttpStatusCode,
  C extends string = string,
  T = any,
> {
  status: S;
  code: C;
  message: string;
  details?: T;
}
