import { DomainError, SystemException } from '@workspace/backend-ddd';

export type MeasureSuccessResult<TValue> = {
  duration: string;
  result: 'Success';
  value: TValue;
};

export type MeasureDomainErrorResult<TValue> = {
  duration: string;
  result: 'DomainError';
  value: TValue;
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

export type MeasureResult<TValue> =
  | MeasureSuccessResult<TValue>
  | MeasureDomainErrorResult<TValue>
  | MeasureSystemExceptionResult
  | MeasureUnexpectedExceptionResult;
