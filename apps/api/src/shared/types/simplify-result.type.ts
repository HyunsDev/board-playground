import { Err, Ok, Result } from 'neverthrow';

export type SimplifyResult<R> = Result<
  R extends Ok<infer T, any> ? T : never,
  R extends Err<any, infer E> ? E : never
>;
