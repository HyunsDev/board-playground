import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CoreContextModule } from '../context';
import { CommandDispatcher } from './command.dispatcher';
import { QueryDispatcher } from './query.dispatcher';

import { CommandDispatcherPort, QueryDispatcherPort } from '@/base';

@Global()
@Module({
  imports: [CqrsModule, CoreContextModule],
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
})
export class CoreCqrsModule {}
