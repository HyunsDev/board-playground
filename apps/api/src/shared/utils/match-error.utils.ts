import { DomainError, UnexpectedDomainErrorException } from '../base';
import { PublicDomainError } from '../base/interface/api-error.types';

/**
 * @template E - 발생 가능한 에러들의 Union
 * @template H - 핸들러 객체
 */
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
    throw new UnexpectedDomainErrorException(error);
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
    // ✨ 핵심 Magic:
    // H(입력받은 핸들러)의 키를 순회하면서,
    // 만약 그 키가 E['code'](진짜 에러 코드)에 없다면 -> 'never' 타입으로 만듭니다.
    // 값(함수)은 'never' 타입에 할당될 수 없으므로, 빨간 줄이 뜨게 됩니다.
    [K in keyof H]: K extends E['code'] ? unknown : never;
  },
): ReturnType<H[keyof H]> {
  const handler = handlers[error.code as keyof H];
  if (!handler) {
    throw new UnexpectedDomainErrorException(error);
  }
  return (handler as any)(error);
}
