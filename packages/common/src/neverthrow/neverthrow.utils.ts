import type { Result } from 'neverthrow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OkOf<R> = R extends Result<infer T, any> ? T : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrOf<R> = R extends Result<any, infer E> ? E : never;
