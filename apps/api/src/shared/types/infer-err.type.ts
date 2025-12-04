import { Result, ResultAsync } from 'neverthrow';

type AllowedResultTypes = Result<any, any> | Promise<Result<any, any>> | ResultAsync<any, any>;

/**
 * Result 타입에서 Err 타입을 추출하는 유틸리티 타입
 */
export type ExtractErr<T> =
  T extends Result<any, infer E>
    ? E
    : T extends Promise<Result<any, infer E>>
      ? E
      : T extends ResultAsync<any, infer E>
        ? E
        : never;

export type InferErr<F extends (...args: any[]) => AllowedResultTypes> = ExtractErr<ReturnType<F>>;
