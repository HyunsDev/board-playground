import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventBus, IEvent } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';

import { AuditLogJob } from './audit-log.job';

import { BaseDomainEvent, BaseDomainEventProps, JobDispatcherPort } from '@/base';
import { ClientContext, TokenContext } from '@/modules/foundation';

interface AuditLogTargetEvent extends IEvent {
  audit?: boolean;
}

@Injectable()
export class AuditLogCollector implements OnModuleInit, OnModuleDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private readonly eventBus: EventBus,
    private readonly jobDispatcher: JobDispatcherPort,
    private readonly clientContext: ClientContext,
    private readonly tokenContext: TokenContext,
  ) {}

  onModuleInit() {
    this.subscription = this.eventBus.subject$.subscribe(async (e: AuditLogTargetEvent) => {
      const isTarget = e.audit === true;

      if (isTarget) {
        const event = e as BaseDomainEvent<BaseDomainEventProps<unknown>>;
        await this.jobDispatcher.dispatch(
          new AuditLogJob(null, {
            event,
            ipAddress: this.clientContext.client?.ipAddress,
            userAgent: this.clientContext.client?.userAgent,
            sessionId: this.tokenContext.token?.sessionId,
          }),
        );
      }
    });
  }

  onModuleDestroy() {
    this.subscription?.unsubscribe();
  }
}
