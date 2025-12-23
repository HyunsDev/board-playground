import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';

import { DomainCodeEnums } from '@workspace/domain';

import { systemLog, SystemLogActionEnum } from '../logging';
import { AuditLogJob } from './audit-log.job';

import { BaseDomainEvent } from '@/base';
import { JobDispatcherPort } from '@/base/messages/ports';
import { TokenContext, ClientContext, MessageContext } from '@/modules/foundation/context';

@Injectable()
export class AuditLogCollector implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(AuditLogCollector.name);
  private subscription: Subscription | null = null;

  constructor(
    private readonly jobDispatcher: JobDispatcherPort,
    private readonly eventBus: EventBus,
    private readonly clientContext: ClientContext,
    private readonly tokenContext: TokenContext,
    private readonly messageContext: MessageContext,
  ) {}

  onModuleInit() {
    this.subscription = this.eventBus.subject$.subscribe({
      next: async (event: unknown) => {
        try {
          if (!(event instanceof BaseDomainEvent)) {
            return;
          }
          const isTarget = event.audit === true;

          if (isTarget) {
            await this.jobDispatcher.dispatch(
              new AuditLogJob(null, {
                plainEvent: event.toPlain(),
                ipAddress: this.clientContext.client?.ipAddress,
                userAgent: this.clientContext.client?.userAgent,
                sessionId: this.tokenContext.token?.sessionId,
              }),
            );
          }
        } catch (err) {
          this.logger.error(
            `Failed to collect audit log for event: ${event?.constructor?.name}`,
            err,
          );
        }
      },
    });

    this.logger.log(
      systemLog(DomainCodeEnums.System.Lifecycle, SystemLogActionEnum.AppInitialize, {
        msg: 'AuditLogCollector initialized and subscribed to EventBus',
      }),
    );
  }

  onModuleDestroy() {
    this.subscription?.unsubscribe();
  }
}
