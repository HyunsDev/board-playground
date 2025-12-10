import { type ErrorHttpStatusCode } from '@ts-rest/core';
import { type ZodIssue } from 'zod';

import { type ApiError } from './api-error.type';

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
