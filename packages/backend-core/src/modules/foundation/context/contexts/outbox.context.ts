/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { AppStore } from '../context.types';

import { BaseDomainEvent, BaseIntegrationEvent, BaseJob } from '@/base';

@Injectable()
export class OutboxContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get jobStore() {
    return this.create<BaseJob<any>>('jobs');
  }

  get domainEventStore() {
    return this.create<BaseDomainEvent<any>>('domainEvents');
  }

  get integrationEventStore() {
    return this.create<BaseIntegrationEvent<any>>('integrationEvents');
  }

  private create<Message extends BaseJob<any> | BaseDomainEvent<any> | BaseIntegrationEvent<any>>(
    storeName: keyof AppStore['outbox'],
  ) {
    const list = (): Message[] => {
      const store = this.cls.get(`outbox.${storeName}`) as Message[] | undefined;
      if (!store) {
        this.cls.set(`outbox.${storeName}`, []);
        return [];
      }
      return store;
    };

    const set = (messages: Message[]) => {
      this.cls.set(`outbox.${storeName}`, messages as any);
    };

    const push = (...messages: Message[]) => {
      this.cls.set(`outbox.${storeName}`, [...list(), ...messages] as any);
    };

    const clear = (): void => {
      this.cls.set(`outbox.${storeName}`, []);
    };

    const length = (): number => {
      const store = list();
      return store.length;
    };

    return {
      list,
      set,
      push,
      clear,
      length,
    };
  }
}
