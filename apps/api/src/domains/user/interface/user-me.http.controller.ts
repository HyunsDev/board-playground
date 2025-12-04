import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { UpdateUserMeProfileCommand } from '../application/commands/update-user-me-profile/update-user-me-profile.command';
import { GetUserMeQuery } from '../application/queries/get-user-me/get-user-me.query';

import { Auth } from '@/infra/security/decorators/auth.decorator';
import { Token } from '@/infra/security/decorators/token.decorator';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { TokenPayload } from '@/shared/types/token-payload.type';
import { matchPublicError } from '@/shared/utils/match-error.utils';

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
          apiOk(200, {
            user: this.dtoMapper.toDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(EXCEPTION.USER.NOT_FOUND),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.me.updateProfile)
  @Auth()
  async updateProfile(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.updateProfile, async ({ body }) => {
      const result = await this.queryBus.execute(
        new UpdateUserMeProfileCommand({
          userId: token.sub,
          nickname: body.nickname,
          bio: body.bio,
        }),
      );

      return result.match(
        (user) =>
          apiOk(200, {
            user: this.dtoMapper.toDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(EXCEPTION.USER.NOT_FOUND),
            UserEmailAlreadyExists: () => apiErr(EXCEPTION.USER.EMAIL_ALREADY_EXISTS),
            UserUsernameAlreadyExists: () => apiErr(EXCEPTION.USER.USERNAME_ALREADY_EXISTS),
          }),
      );
    });
  }
}
