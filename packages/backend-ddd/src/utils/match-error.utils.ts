/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiError } from '@workspace/common';

import { DomainError } from '../error/base.domain-errors';
import { InvariantViolationException } from '../error/ddd.system-exceptions';
import { PublicDomainError } from '../error/error.types';

type InferHandlerResult<H> = H extends Record<string, (...args: any) => infer R> ? R : never;

function _match<E extends { code: string }, H extends Record<string, any>>(
  error: E,
  handlers: H,
): any {
  if (!error) {
    throw new InvariantViolationException('matchError called with null/undefined error');
  }

  const handler = handlers[error.code];

  if (handler) {
    return handler(error);
  }

  if (handlers.fallback) {
    return handlers.fallback(error);
  }

  throw new InvariantViolationException(`Unhandled domain error code: ${error.code}`);
}

/**
 * 일반 도메인 에러 처리용
 */
export function matchError<
  E extends DomainError,
  const H extends {
    [Code in E['code']]?: (error: Extract<E, { code: Code }>) => any;
  } & {
    fallback?: (error: E) => any;
  },
>(
  error: E,
  handlers: H &
    (undefined extends H['fallback']
      ? { [Code in E['code']]: (error: Extract<E, { code: Code }>) => any }
      : unknown),
): [E] extends [never] ? never : InferHandlerResult<H> {
  return _match(error, handlers);
}

/**
 * Public 도메인 에러 처리용
 */
export function matchPublicError<
  E extends PublicDomainError,
  const H extends {
    [Code in E['code']]?: (error: Extract<E, { code: Code }>) => any;
  } & {
    fallback?: (error: E) => any;
  },
>(
  error: E,
  handlers: H &
    (undefined extends H['fallback']
      ? { [Code in E['code']]: (error: Extract<E, { code: Code }>) => any }
      : unknown),
): [E] extends [never] ? never : InferHandlerResult<H> {
  return _match(error, handlers);
}

/**
 * API 에러 변환용
 * - 핸들러들이 반드시 `ApiError`를 반환하도록 강제하여 안전성을 높였습니다.
 */
export function matchApiError<
  E extends PublicDomainError,
  const H extends {
    [Code in E['code']]?: (error: Extract<E, { code: Code }>) => ApiError;
  } & {
    fallback?: (error: E) => ApiError;
  },
>(
  error: E,
  handlers: H &
    (undefined extends H['fallback']
      ? { [Code in E['code']]: (error: Extract<E, { code: Code }>) => ApiError }
      : unknown),
): [E] extends [never] ? never : InferHandlerResult<H> {
  return _match(error, handlers);
}
