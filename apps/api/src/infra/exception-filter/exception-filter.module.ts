import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { DomainExceptionFilter } from './domain-exception.filter';
import { GlobalExceptionsFilter } from './global-exception.filter';
import { RequestValidationFilter } from './request-validation.filter';

const filters = [
  {
    provide: APP_FILTER,
    useClass: GlobalExceptionsFilter,
  },
  {
    provide: APP_FILTER,
    useClass: RequestValidationFilter,
  },
  {
    provide: APP_FILTER,
    useClass: DomainExceptionFilter,
  },
];

@Module({
  providers: [...filters],
})
export class ExceptionFilterModule {}
