import { ZodIssue } from 'zod';

export interface ApiErrorResponseBody<T = any> {
  status: number;
  code: string;
  message: string;
  details?: T;
}

export type ValidationDetails = {
  body: ZodIssue[] | null;
  query: ZodIssue[] | null;
  pathParams: ZodIssue[] | null;
  headers: ZodIssue[] | null;
};
export type ApiValidationErrorResponseBody = ApiErrorResponseBody<ValidationDetails>;
