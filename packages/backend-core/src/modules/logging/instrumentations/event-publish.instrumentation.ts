import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainCodeEnums } from '@workspace/domain';

import { systemLog } from '../helpers';
import { LogTypeEnum } from '../log.enums';
import { EventPublishedLogData, SystemLogActionEnum } from '../types';

import { BaseDomainEvent, BaseDomainEventProps } from '@/base';

@Injectable()
export class EventPublishInstrumentation implements OnApplicationBootstrap {
  private readonly logger = new Logger(EventPublishInstrumentation.name);

  constructor(private readonly eventBus: EventBus) {}

  onApplicationBootstrap() {
    this.wrapEventBusPublish(this.eventBus);

    this.logger.log(
      systemLog(DomainCodeEnums.System.Infra, SystemLogActionEnum.AppInitialize, {
        msg: 'EventPublish Instrumentation initialized: EventBus publish wrapped.',
      }),
    );
  }

  private wrapEventBusPublish(bus: EventBus) {
    const originalPublish = bus.publish.bind(bus);
    const originalPublishAll = bus.publishAll.bind(bus);
    bus.publish = <T extends BaseDomainEvent<BaseDomainEventProps<unknown>>>(event: T) => {
      this.logEventPublish(event);
      return originalPublish(event);
    };
    bus.publishAll = <T extends BaseDomainEvent<BaseDomainEventProps<unknown>>>(events: T[]) => {
      events.forEach((event) => this.logEventPublish(event));
      return originalPublishAll(events);
    };
  }

  private logEventPublish(event: BaseDomainEvent<BaseDomainEventProps<unknown>>) {
    const eventName = event?.constructor?.name || 'UnknownEvent';
    this.logger.debug(
      {
        type: LogTypeEnum.EventPublished,
        code: event.code,
        ...event.metadata,
      } satisfies EventPublishedLogData,
      eventName,
    );
  }
}
