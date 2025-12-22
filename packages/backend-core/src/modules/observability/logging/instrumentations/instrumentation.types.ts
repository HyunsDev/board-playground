/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomainError, DomainResult, SystemException } from '@workspace/backend-ddd';

export type MeasureSuccessResult<TValue = DomainResult<any, DomainError>> = {
  duration: string;
  result: 'Success';
  value: TValue;
};

export type MeasureDomainErrorResult<TValue = DomainResult<any, DomainError>> = {
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

export type MeasureResult<
  TValue extends DomainResult<any, DomainError> = DomainResult<any, DomainError>,
> =
  | MeasureSuccessResult<TValue>
  | MeasureDomainErrorResult<TValue>
  | MeasureSystemExceptionResult
  | MeasureUnexpectedExceptionResult;
