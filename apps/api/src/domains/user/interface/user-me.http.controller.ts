import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserMeQuery } from '../application/queries/get-user-me/get-user-me.query';
import { UserNotFoundError } from '../domain/user.errors';

import { Auth } from '@/infra/security/decorators/auth.decorator';
import { Token } from '@/infra/security/decorators/token.decorator';
import { TokenPayload } from '@/shared/types/token-payload.type';
import { mapDomainErrorToResponse } from '@/shared/utils/error-mapper';

@Controller()
export class UserMeHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
  ) {}

  @TsRestHandler(contract.user.me.get)
  @Auth()
  async getMe(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.get, async () => {
      const result = await this.queryBus.execute(new GetUserMeQuery(token.sub));
      return result.match(
        (user) =>
          ({
            status: 200,
            body: {
              user: this.dtoMapper.toDto(user),
            },
          }) as const,
        (error) => {
          if (error instanceof UserNotFoundError) {
            return {
              status: 404,
              body: {
                ...EXCEPTION.USER.NOT_FOUND,
              },
            } as const;
          }
          return mapDomainErrorToResponse(error);
        },
      );
    });
  }
}
