import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { SessionDtoMapper } from './session.dto-mapper';
import {
  GetSessionQuery,
  GetSessionQueryResult,
} from '../application/queries/get-session/get-session.query';
import {
  ListSessionsQuery,
  ListSessionsQueryResult,
} from '../application/queries/list-sessions/list-sessions.query';

import { Token } from '@/infra/security/decorators/token.decorator';
import { apiErr, apiOk } from '@/shared/base';
import { TokenPayload } from '@/shared/schemas/token-payload.schema';
import { matchError } from '@/shared/utils/match-error.utils';

@Controller()
export class SessionHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly sessionDtoMapper: SessionDtoMapper,
  ) {}

  @TsRestHandler(contract.session.get)
  async getSession(@Token() token: TokenPayload) {
    return tsRestHandler(contract.session.get, async ({ params }) => {
      const result = await this.queryBus.execute<GetSessionQueryResult>(
        new GetSessionQuery(token.sub, params.sessionId),
      );

      return result.match(
        (session) => apiOk(200, { session: this.sessionDtoMapper.toDto(session) }),
        (error) =>
          matchError(error, {
            SessionNotFound: () => apiErr(EXCEPTION.SESSION.NOT_FOUND),
          }),
      );
    });
  }

  @TsRestHandler(contract.session.list)
  async listSessions(@Token() token: TokenPayload) {
    return tsRestHandler(contract.session.list, async () => {
      const result = await this.queryBus.execute<ListSessionsQueryResult>(
        new ListSessionsQuery(token.sub),
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
}
