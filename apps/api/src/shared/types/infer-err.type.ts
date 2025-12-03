import { Result, ResultAsync } from 'neverthrow';

type AllowedResultTypes = Result<any, any> | Promise<Result<any, any>> | ResultAsync<any, any>;

type ExtractErr<T> =
  T extends Result<any, infer E>
    ? E
    : T extends Promise<Result<any, infer E>>
      ? E
      : T extends ResultAsync<any, infer E>
        ? E
        : never;

export type InferErr<F extends (...args: any[]) => AllowedResultTypes> = ExtractErr<ReturnType<F>>;
