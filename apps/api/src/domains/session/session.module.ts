import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DeleteSessionCommandHandler } from './application/commands/delete-session.command';
import { SessionFacade } from './application/facades/session.facade';
import { GetSessionQueryHandler } from './application/queries/get-session.query';
import { ListSessionsQueryHandler } from './application/queries/list-sessions.query';
import { RefreshTokenMapper } from './infra/refresh-token.mapper';
import { SessionMapper } from './infra/session.mapper';
import { SessionRepository } from './infra/session.repository';
import { SessionDtoMapper } from './interface/session.dto-mapper';
import { SessionHttpController } from './interface/session.http.controller';
import { SESSION_REPOSITORY } from './session.constants';

const httpControllers = [SessionHttpController];
const commandHandlers: Provider[] = [DeleteSessionCommandHandler];
const queryHandlers: Provider[] = [GetSessionQueryHandler, ListSessionsQueryHandler];
const services: Provider[] = [SessionFacade];
const mappers: Provider[] = [SessionMapper, SessionDtoMapper, RefreshTokenMapper];
const repositories: Provider[] = [
  {
    provide: SESSION_REPOSITORY,
    useClass: SessionRepository,
  },
];

@Module({
  imports: [CqrsModule],
  providers: [
    Logger,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    ...mappers,
    ...repositories,
  ],
  controllers: [...httpControllers],
  exports: [SessionFacade],
})
export class SessionModule {}
