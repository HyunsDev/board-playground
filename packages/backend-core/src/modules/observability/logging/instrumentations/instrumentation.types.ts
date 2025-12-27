import { SystemException } from '@workspace/backend-ddd';

// 성공 시에는 Result 객체 전체 혹은 Unwrapped 된 값을 가지고 있을 수 있습니다.
// 여기서는 일관성을 위해 measure 함수의 반환값인 TResult(Result 객체)를 그대로 유지합니다.
export type MeasureSuccessResult<TResult> = {
  readonly result: 'Success';
  readonly duration: string;
  readonly value: TResult;
};

export type MeasureDomainErrorResult<TResult, TError> = {
  readonly result: 'DomainError';
  readonly duration: string;
  readonly value: TResult; // 실패한 Result 객체
  readonly error: TError; // 추출된 도메인 에러
};

export type MeasureSystemExceptionResult = {
  readonly result: 'SystemException';
  readonly duration: string;
  readonly error: SystemException;
};

export type MeasureUnexpectedExceptionResult = {
  readonly result: 'UnexpectedException';
  readonly duration: string;
  readonly error: unknown;
};

export type MeasureResult<TResult, TError> =
  | MeasureSuccessResult<TResult>
  | MeasureDomainErrorResult<TResult, TError>
  | MeasureSystemExceptionResult
  | MeasureUnexpectedExceptionResult;
