import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { envSchema } from './config/env.validation';
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
];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => {
        const parsed = envSchema.safeParse(env);
        if (!parsed.success) {
          console.error(parsed.error.format());
          throw new Error('❌ Invalid environment variables');
        }
        return parsed.data;
      },
    }),
    EventEmitterModule.forRoot(),
    CqrsModule,
  ],
  providers: [...filters],
  exports: [CqrsModule, EventEmitterModule],
})
export class CoreModule {}
