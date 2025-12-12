import { DomainError, InvariantViolationException } from '../base';
import { PublicDomainError } from '../base/interface/api-error.types';

export function matchError<
  E extends DomainError,
  const H extends {
    [Code in E['code']]: (error: Extract<E, { code: Code }>) => any;
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
  return (handler as any)(error);
}

export function matchPublicError<
  E extends PublicDomainError,
  const H extends {
    [Code in E['code']]: (error: Extract<E, { code: Code }>) => any;
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
  return (handler as any)(error);
}
