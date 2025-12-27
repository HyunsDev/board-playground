/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultAsync } from 'neverthrow';

import { matchError } from './match-error.utils';

import { DomainError, PublicDomainError } from '@/error';

export async function matchResult<T, E extends DomainError, R>(
  resultAsync: ResultAsync<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: {
      [Code in E['code']]: (error: Extract<E, { code: Code }>) => R;
    };
  },
): Promise<R> {
  const result = await resultAsync;
  return result.match(
    (value) => handlers.ok(value),
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
  const result = await resultAsync;

  return result.match(
    (value) => handlers.ok(value),
    (error) => matchError(error, handlers.err as any),
  );
}
