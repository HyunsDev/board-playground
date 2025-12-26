import { DomainError } from '../error/base.domain-errors';
import { InvariantViolationException } from '../error/ddd.system-exceptions';
import { PublicDomainError } from '../error/error.types';

export function matchError<
  E extends DomainError,
  const H extends {
    [Code in E['code']]: (error: Extract<E, { code: Code }>) => unknown;
  },
>(
  error: E,
  handlers: H & {
    [K in keyof H]: K extends E['code'] ? unknown : never;
  },
): ReturnType<H[keyof H]> {
  const handler = handlers[error.code as keyof H];
  if (!handler) {
    throw new InvariantViolationException(error.code);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any)(error);
}

export function matchPublicError<
  E extends PublicDomainError,
  const H extends {
    [Code in E['code']]: (error: Extract<E, { code: Code }>) => unknown;
  },
>(
  error: E,
  handlers: H & {
    [K in keyof H]: K extends E['code'] ? unknown : never;
  },
): ReturnType<H[keyof H]> {
  const handler = handlers[error.code as keyof H];
  if (!handler) {
    throw new InvariantViolationException(error.code);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (handler as any)(error);
}
