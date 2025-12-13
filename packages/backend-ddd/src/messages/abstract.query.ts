import { PaginationQuery } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './internal/abstract.message';

import { DomainError, DomainResult } from '@/error';

export type AbstractQueryProps<T = unknown> = AbstractMessageProps<T>;

export type AbstractPaginatedQueryProps<
  T extends PaginationQuery<unknown> = PaginationQuery<unknown>,
> = AbstractMessageProps<T>;

export type AbstractPaginatedQueryResult<C extends AbstractQuery> =
  C extends AbstractQuery<string, string, string, AbstractQueryProps, unknown, infer TRes>
    ? TRes
    : never;

export abstract class AbstractQuery<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  QueryCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractQueryProps = AbstractQueryProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, QueryCodeType, TProps, TOk, TRes> {}
