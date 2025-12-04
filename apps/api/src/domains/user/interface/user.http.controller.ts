import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserQuery, GetUserQueryResult } from '../application/queries/get-user/get-user.query';

import { apiErr, apiOk } from '@/shared/base';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class UserHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
  ) {}

  @TsRestHandler(contract.user.get)
  async getUser() {
    return tsRestHandler(contract.user.get, async ({ params }) => {
      const result = await this.queryBus.execute<GetUserQueryResult>(
        new GetUserQuery(params.userId),
      );

      return result.match(
        (user) => apiOk(200, { user: this.dtoMapper.toDto(user) }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(EXCEPTION.USER.NOT_FOUND),
          }),
      );
    });
  }
}
