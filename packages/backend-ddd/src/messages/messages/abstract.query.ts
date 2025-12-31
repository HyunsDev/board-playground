import { PaginationQuery } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { RESULT_TYPE_SYMBOL } from '../message.constant';
import { AbstractMessageGenerics } from '../message.types';

import { DomainError, DomainResult } from '@/error';

export type AbstractQueryProps<T = unknown> = AbstractMessageProps<T>;

export type AbstractPaginatedQueryProps<
  T extends PaginationQuery<unknown> = PaginationQuery<unknown>,
> = AbstractMessageProps<T>;

export type AbstractPaginatedQueryResult<C extends AbstractQuery> =
  C extends AbstractQuery<AbstractMessageGenerics, AbstractQueryProps, unknown, infer TRes>
    ? TRes
    : never;

export abstract class AbstractQuery<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractQueryProps = AbstractQueryProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<TGenerics, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
}
