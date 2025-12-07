import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, ApiErrors, USER_ROLE } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserForAdminQuery } from '../application/queries/get-user-for-admin.query';

import { ContextService } from '@/infra/context/context.service';
import { Auth } from '@/infra/security/decorators/auth.decorator';
import { apiErr, apiOk } from '@/shared/base';
import { matchError } from '@/shared/utils/match-error.utils';

@Controller()
@Auth(USER_ROLE.ADMIN)
export class UserAdminHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.admin.user.get)
  async getUserForAdmin() {
    return tsRestHandler(contract.admin.user.get, async ({ params }) => {
      const result = await this.queryBus.execute(
        new GetUserForAdminQuery(
          { userId: params.userId },
          this.contextService.getMessageMetadata(),
        ),
      );

      return result.match(
        (user) => apiOk(200, { user: this.dtoMapper.toDto(user) }),
        (error) =>
          matchError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }
}
