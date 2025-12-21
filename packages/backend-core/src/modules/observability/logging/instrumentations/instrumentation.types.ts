import { DomainError, DomainResult, SystemException } from '@workspace/backend-ddd';

export type MeasureSuccessResult = {
  duration: string;
  result: 'Success';
  value: DomainResult<unknown, DomainError>;
};
export type MeasureDomainErrorResult = {
  duration: string;
  result: 'DomainError';
  value: DomainResult<unknown, DomainError>;
  error: DomainError;
};
export type MeasureSystemExceptionResult = {
  duration: string;
  result: 'SystemException';
  error: SystemException;
};
export type MeasureUnexpectedExceptionResult = {
  duration: string;
  result: 'UnexpectedException';
  error: unknown;
};
export type MeasureResult =
  | MeasureSuccessResult
  | MeasureDomainErrorResult
  | MeasureSystemExceptionResult
  | MeasureUnexpectedExceptionResult;
