import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { MessageContext, QueryDispatcherPort, Roles, Trigger } from '@workspace/backend-core';
import { apiOk, matchError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors, USER_ROLE } from '@workspace/contract';
import { TriggerCodeEnum } from '@workspace/domain';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserForAdminQuery } from '../application/admin/queries/get-user-for-admin.query';

@Controller()
@Roles(USER_ROLE.ADMIN)
export class UserAdminHttpController {
  constructor(
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly dtoMapper: UserDtoMapper,
    private readonly messageContext: MessageContext,
  ) {}

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.admin.user.get)
  async getUserForAdmin() {
    return tsRestHandler(contract.admin.user.get, async ({ params }) => {
      const result = await this.queryDispatcher.execute(
        new GetUserForAdminQuery({ userId: params.userId }),
      );

      return result.match(
        (user) => apiOk(200, { user: this.dtoMapper.toUserAdminDto(user) }),
        (error) =>
          matchError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }
}
