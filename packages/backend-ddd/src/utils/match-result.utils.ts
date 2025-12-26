import { ResultAsync } from 'neverthrow';

import { matchError } from './match-error.utils';

import { DomainError, PublicDomainError } from '@/error';

/**
 * ResultAsync를 풀어서 성공 시와 에러 코드별 핸들러를 실행합니다.
 */
export async function matchResult<T, E extends DomainError, R>(
  resultAsync: ResultAsync<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: {
      [Code in E['code']]: (error: Extract<E, { code: Code }>) => R;
    };
  },
): Promise<R> {
  // 1. ResultAsync를 await 하여 Result로 만듦
  const result = await resultAsync;

  // 2. neverthrow의 기본 match 사용
  return result.match(
    // 성공 케이스
    (value) => handlers.ok(value),

    // 실패 케이스 -> 현우 님의 matchError 함수로 위임!
    (error) => matchError(error, handlers.err as any),
  );
}

export async function matchPublicResult<T, E extends PublicDomainError, R>(
  resultAsync: ResultAsync<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: {
      [Code in E['code']]: (error: Extract<E, { code: Code }>) => R;
    };
  },
): Promise<R> {
  // 1. ResultAsync를 await 하여 Result로 만듦
  const result = await resultAsync;

  // 2. neverthrow의 기본 match 사용
  return result.match(
    // 성공 케이스
    (value) => handlers.ok(value),

    // 실패 케이스 -> 현우 님의 matchError 함수로 위임!
    (error) => matchError(error, handlers.err as any),
  );
}
