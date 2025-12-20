/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators } from '@nestjs/common';
import {
  QueryHandler as NestQueryHandler,
  CommandHandler as NestCommandHandler,
} from '@nestjs/cqrs';

import { BaseCommand, BaseQuery } from '@/base';

export const QueryHandler = (query: typeof BaseQuery<any, any, any>) => {
  return applyDecorators(NestQueryHandler(query));
};

export const CommandHandler = (command: typeof BaseCommand<any, any, any>) => {
  return applyDecorators(NestCommandHandler(command));
};
