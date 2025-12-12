import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { UserRepositoryPort } from '../../domain/user.repository.port';

import { SessionCreatedEvent } from '@/domains/session/domain/events/session-created.event';
import { SessionRefreshedEvent } from '@/domains/session/domain/events/session-refreshed.event';

@EventsHandler(SessionCreatedEvent, SessionRefreshedEvent)
export class UserActivityEventHandler
  implements IEventHandler<SessionCreatedEvent | SessionRefreshedEvent>
{
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async handle(event: SessionCreatedEvent | SessionRefreshedEvent) {
    const result = await this.userRepo.updateLastActiveAt(event.data.userId);
    return result;
  }
}
