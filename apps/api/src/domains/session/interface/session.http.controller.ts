import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, ApiErrors } from '@workspace/contract';
import { TokenPayload } from '@workspace/contract';

import { SessionDtoMapper } from './session.dto-mapper';
import { DeleteSessionCommand } from '../application/commands/delete-session.command';
import { GetSessionQuery } from '../application/queries/get-session.query';
import { ListSessionsQuery } from '../application/queries/list-sessions.query';

import { ContextService } from '@/infra/context/context.service';
import { Auth } from '@/infra/security/decorators/auth.decorator';
import { Token } from '@/infra/security/decorators/token.decorator';
import { apiErr, apiOk } from '@/shared/base';
import { matchError } from '@/shared/utils/match-error.utils';

@Controller()
export class SessionHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly sessionDtoMapper: SessionDtoMapper,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.session.get)
  @Auth()
  async getSession(@Token() token: TokenPayload) {
    return tsRestHandler(contract.session.get, async ({ params }) => {
      const result = await this.queryBus.execute(
        new GetSessionQuery(
          { userId: token.sub, sessionId: params.sessionId },
          this.contextService.getMessageMetadata(),
        ),
      );

      return result.match(
        (session) => apiOk(200, { session: this.sessionDtoMapper.toDto(session) }),
        (error) =>
          matchError(error, {
            SessionNotFound: () => apiErr(ApiErrors.Session.NotFound),
          }),
      );
    });
  }

  @TsRestHandler(contract.session.list)
  @Auth()
  async listSessions(@Token() token: TokenPayload) {
    return tsRestHandler(contract.session.list, async () => {
      const result = await this.queryBus.execute(
        new ListSessionsQuery({ userId: token.sub }, this.contextService.getMessageMetadata()),
      );

      return result.match(
        (sessions) =>
          apiOk(200, {
            sessions: sessions.map((session) => this.sessionDtoMapper.toDto(session)),
          }),
        () => null,
      );
    });
  }

  @TsRestHandler(contract.session.delete)
  @Auth()
  async deleteSession(@Token() token: TokenPayload) {
    return tsRestHandler(contract.session.delete, async ({ params }) => {
      const result = await this.commandBus.execute(
        new DeleteSessionCommand(
          {
            sessionId: params.sessionId,
            userId: token.sub,
            currentSessionId: token.sessionId,
          },
          this.contextService.getMessageMetadata(),
        ),
      );

      return result.match(
        () => apiOk(204, null),
        (error) =>
          matchError(error, {
            CurrentSessionCannotBeDeleted: () =>
              apiErr(ApiErrors.Session.CurrentSessionCannotBeDeleted),
            SessionNotFound: () => apiErr(ApiErrors.Session.NotFound),
          }),
      );
    });
  }
}
