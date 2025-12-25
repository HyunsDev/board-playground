import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { MessageContext, QueryDispatcherPort, Trigger } from '@workspace/backend-core';
import { apiOk, matchPublicError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TriggerCodeEnum } from '@workspace/domain';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserQuery } from '../application/public/queries/get-user.query';
import { SearchUserQuery } from '../application/public/queries/search-user.query';

@Controller()
@Trigger(TriggerCodeEnum.Http)
export class UserHttpController {
  constructor(
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly dtoMapper: UserDtoMapper,
    private readonly messageContext: MessageContext,
  ) {}

  @TsRestHandler(contract.user.get)
  async getUser() {
    return tsRestHandler(contract.user.get, async ({ params }) => {
      const result = await this.queryDispatcher.execute(
        new GetUserQuery({ userId: params.userId }),
      );

      return result.match(
        (user) => apiOk(200, { user: this.dtoMapper.toPublicProfileDto(user) }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.search)
  async searchUsers() {
    return tsRestHandler(contract.user.search, async ({ query }) => {
      const result = await this.queryDispatcher.execute(
        new SearchUserQuery({
          nickname: query.nickname,
          page: query.page,
          limit: query.limit,
        }),
      );

      return result.match(
        (data) => apiOk(200, this.dtoMapper.toPaginatedPublicProfileDto(data.items, data.meta)),
        (error) => matchPublicError(error, {}),
      );
    });
  }
}
