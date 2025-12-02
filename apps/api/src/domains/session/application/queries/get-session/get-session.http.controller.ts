import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { GetSessionQuery } from './get-session.query';
import { SessionNotFoundError } from '../../../domain/session.errors';
import { SessionDtoMapper } from '../../../interface/session.dto-mapper';

@Controller()
export class GetDeviceHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly sessionDtoMapper: SessionDtoMapper,
  ) {}

  @TsRestHandler(contract.session.get)
  async getSession() {
    return tsRestHandler(contract.session.get, async ({ params }) => {
      const result = await this.queryBus.execute(new GetSessionQuery(params.sessionId));

      return result.match(
        (session) =>
          ({
            status: 200,
            body: { session: this.sessionDtoMapper.toDto(session) },
          }) as const,
        (error) => {
          if (error instanceof SessionNotFoundError) {
            return {
              status: 404,
              body: {
                ...EXCEPTION.SESSION.NOT_FOUND,
              },
            } as const;
          }
          throw error;
        },
      );
    });
  }
}
