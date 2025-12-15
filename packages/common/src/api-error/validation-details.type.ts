import { type ErrorHttpStatusCode } from '@ts-rest/core';
import { z } from 'zod';

import { type ApiError } from './api-error.type';

export type ValidationDetails = {
  body: z.core.$ZodIssue[] | null;
  query: z.core.$ZodIssue[] | null;
  pathParams: z.core.$ZodIssue[] | null;
  headers: z.core.$ZodIssue[] | null;
};

/**
 * 클라이언트의 요청 유효성 검사 실패에 대한 세부 정보를 나타냅니다.
 */
export type ApiValidationError<S extends ErrorHttpStatusCode, C extends string> = ApiError<
  S,
  C,
  ValidationDetails
>;
