import { ErrorHttpStatusCode } from '@ts-rest/core';
import { ZodIssue } from 'zod';

import { ApiError } from './api-error.type';

export type ValidationDetails = {
  body: ZodIssue[] | null;
  query: ZodIssue[] | null;
  pathParams: ZodIssue[] | null;
  headers: ZodIssue[] | null;
};
export type ApiValidationError<S extends ErrorHttpStatusCode, C extends string> = ApiError<
  S,
  C,
  ValidationDetails
>;
