import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { GetDeviceHttpController } from './application/queries/get-session/get-session.http.controller';
import { GetSessionQueryHandler } from './application/queries/get-session/get-session.query';
import { RefreshTokenService } from './application/services/refresh-token.service';
import { SessionService } from './application/services/session.service';
import { RefreshTokenMapper } from './infra/refresh-token.mapper';
import { RefreshTokenRepository } from './infra/refresh-token.repository';
import { SessionMapper } from './infra/session.mapper';
import { SessionRepository } from './infra/session.repository';
import { SessionDtoMapper } from './interface/session.dto-mapper';
import { REFRESH_TOKEN_REPOSITORY, SESSION_REPOSITORY } from './session.di-tokens';

const httpControllers = [GetDeviceHttpController];
const commandHandlers: Provider[] = [];
const queryHandlers: Provider[] = [GetSessionQueryHandler];
const services: Provider[] = [SessionService, RefreshTokenService];
const mappers: Provider[] = [SessionMapper, SessionDtoMapper, RefreshTokenMapper];
const repositories: Provider[] = [
  {
    provide: SESSION_REPOSITORY,
    useClass: SessionRepository,
  },
  {
    provide: REFRESH_TOKEN_REPOSITORY,
    useClass: RefreshTokenRepository,
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
  exports: [
    SessionMapper,
    SessionDtoMapper,
    RefreshTokenMapper,
    SessionService,
    RefreshTokenService,
  ],
})
export class SessionModule {}
