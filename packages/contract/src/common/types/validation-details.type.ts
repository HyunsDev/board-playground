import { type ErrorHttpStatusCode } from '@ts-rest/core';
import { type ZodIssue } from 'zod';

import { type ApiError } from './api-error.type';

export type ValidationDetails = {
  body: ZodIssue[] | null;
  query: ZodIssue[] | null;
  pathParams: ZodIssue[] | null;
  headers: ZodIssue[] | null;
};

/**
 * 클라이언트의 요청 유효성 검사 실패에 대한 세부 정보를 나타냅니다.
 */
export type ApiValidationError<S extends ErrorHttpStatusCode, C extends string> = ApiError<
  S,
  C,
  ValidationDetails
>;
