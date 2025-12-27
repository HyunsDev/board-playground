import { Logger, Module, Provider } from '@nestjs/common';

import { DeleteSessionCommandHandler } from './application/commands/delete-session.command';
import { SessionFacade } from './application/facades/session.facade';
import { GetSessionQueryHandler } from './application/queries/get-session.query';
import { ListSessionsQueryHandler } from './application/queries/list-sessions.query';
import { RefreshTokenRepositoryPort } from './domain/refresh-token.repository.port';
import { SessionRepositoryPort } from './domain/session.repository.port';
import { RefreshTokenMapper } from './infra/refresh-token.mapper';
import { RefreshTokenRepository } from './infra/refresh-token.repository';
import { SessionMapper } from './infra/session.mapper';
import { SessionRepository } from './infra/session.repository';
import { SessionDtoMapper } from './interface/session.dto-mapper';
import { SessionHttpController } from './interface/session.http.controller';

import { CryptoModule } from '@/infra/crypto';

const httpControllers = [SessionHttpController];
const commandHandlers: Provider[] = [DeleteSessionCommandHandler];
const queryHandlers: Provider[] = [GetSessionQueryHandler, ListSessionsQueryHandler];
const services: Provider[] = [SessionFacade];
const mappers: Provider[] = [SessionMapper, SessionDtoMapper, RefreshTokenMapper];
const repositories: Provider[] = [
  {
    provide: SessionRepositoryPort,
    useClass: SessionRepository,
  },
  {
    provide: RefreshTokenRepositoryPort,
    useClass: RefreshTokenRepository,
  },
];

@Module({
  imports: [CryptoModule],
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
