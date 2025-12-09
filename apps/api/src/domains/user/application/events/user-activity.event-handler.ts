import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../infra/user.repository';
import { USER_REPOSITORY } from '../../user.constant';

import { SessionCreatedEvent } from '@/domains/session/domain/events/session-created.event';
import { SessionRefreshedEvent } from '@/domains/session/domain/events/session-refreshed.event';

@EventsHandler(SessionCreatedEvent, SessionRefreshedEvent)
export class UserActivityEventHandler
  implements IEventHandler<SessionCreatedEvent | SessionRefreshedEvent>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async handle(event: SessionCreatedEvent | SessionRefreshedEvent) {
    const result = await this.userRepo.updateLastActiveAt(event.data.userId);
    return result;
  }
}
