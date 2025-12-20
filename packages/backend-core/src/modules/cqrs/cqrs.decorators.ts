/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators } from '@nestjs/common';
import {
  QueryHandler as NestQueryHandler,
  CommandHandler as NestCommandHandler,
} from '@nestjs/cqrs';

import { MessageConstructor } from '@workspace/backend-ddd';

import { BaseCommand, BaseCommandProps, BaseQuery, BaseQueryProps } from '@/base';

export const QueryHandler = <
  T extends MessageConstructor<BaseQuery<BaseQueryProps<any>, any, any>>,
>(
  query: T,
) => {
  return applyDecorators(NestQueryHandler(query));
};

export const CommandHandler = <
  T extends MessageConstructor<BaseCommand<BaseCommandProps<any>, any, any>>,
>(
  command: T,
) => {
  return applyDecorators(NestCommandHandler(command));
};
