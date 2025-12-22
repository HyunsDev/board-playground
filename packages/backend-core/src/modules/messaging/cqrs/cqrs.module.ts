import { Global, Module } from '@nestjs/common';
import { CqrsModule as NestCqrsModule } from '@nestjs/cqrs';

import { CommandDispatcher } from './command.dispatcher';
import { QueryDispatcher } from './query.dispatcher';

import { CommandDispatcherPort, QueryDispatcherPort } from '@/base';

@Global()
@Module({
  imports: [NestCqrsModule.forRoot()],
  providers: [
    {
      provide: CommandDispatcherPort,
      useClass: CommandDispatcher,
    },
    {
      provide: QueryDispatcherPort,
      useClass: QueryDispatcher,
    },
  ],
  exports: [CommandDispatcherPort, QueryDispatcherPort],
})
export class CqrsModule {}
