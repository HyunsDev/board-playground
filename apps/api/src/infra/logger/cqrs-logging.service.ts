import { performance } from 'perf_hooks';

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class CqrsLoggingService implements OnModuleInit {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  onModuleInit() {
    this.wrapBusExecute(this.commandBus, 'CommandBus');
    this.wrapBusExecute(this.queryBus, 'QueryBus');
    this.wrapBusPublish(this.eventBus, 'EventBus');
  }

  private wrapBusExecute(bus: CommandBus | QueryBus, busName: string) {
    const originalExecute = bus.execute.bind(bus);
    const logger = new Logger(busName);

    // eslint-disable-next-line functional/no-expression-statements
    bus.execute = async <T extends { constructor: { name: string } }, R>(
      command: T,
    ): Promise<R> => {
      const start = performance.now();
      const commandName = command?.constructor?.name || 'UnknownCommand';

      try {
        const result = await originalExecute(command);
        const duration = (performance.now() - start).toFixed(0);

        if (result && typeof (result as any).isErr === 'function' && (result as any).isErr()) {
          const { error } = result as any;
          logger.warn(
            {
              duration,
              err: error,
            },
            commandName,
          );
        } else {
          // 성공 시
          logger.log(
            {
              duration,
            },
            commandName,
          );
        }

        return result;
      } catch (error: any) {
        // 예상치 못한 예외 (System Error)
        const duration = (performance.now() - start).toFixed(0);
        logger.error(
          {
            duration,
            err: error,
          },
          commandName,
        );
        throw error;
      }
    };
  }

  private wrapBusPublish(bus: EventBus, busName: string) {
    const originalPublish = bus.publish.bind(bus);
    const originalPublishAll = bus.publishAll.bind(bus);
    const logger = new Logger(busName);

    // eslint-disable-next-line functional/no-expression-statements
    bus.publish = <T>(event: T) => {
      const eventName = (event as any)?.constructor?.name || 'UnknownEvent';
      logger.log(
        {
          event: event,
        },
        eventName,
      ); // 단순 발행 로그
      return originalPublish(event);
    };

    // eslint-disable-next-line functional/no-expression-statements
    bus.publishAll = <T>(events: T[]) => {
      events.forEach((event) => {
        const eventName = (event as any)?.constructor?.name || 'UnknownEvent';
        logger.log(
          {
            event: event,
          },
          eventName,
        ); // 단순 발행 로그
      });
      return originalPublishAll(events);
    };
  }
}
