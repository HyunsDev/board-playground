import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { DomainExceptionFilter } from './filters/domain-exception.filter';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import { RequestValidationFilter } from './filters/request-validation.filter';

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
