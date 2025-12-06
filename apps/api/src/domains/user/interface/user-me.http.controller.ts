import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, ApiErrors } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { DeleteUserMeCommand } from '../application/commands/delete-user-me.command';
import { UpdateUserMeProfileCommand } from '../application/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommand } from '../application/commands/update-user-me-username.command';
import { GetUserMeQuery } from '../application/queries/get-user-me.query';

import { Auth } from '@/infra/security/decorators/auth.decorator';
import { Token } from '@/infra/security/decorators/token.decorator';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { TokenPayload } from '@/shared/schemas/token-payload.schema';
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
      const result = await this.queryBus.execute(new GetUserMeQuery({ userId: token.sub }));
      return result.match(
        (user) =>
          apiOk(200, {
            me: this.dtoMapper.toUserForMeDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
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
            me: this.dtoMapper.toUserForMeDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
            UserEmailAlreadyExists: () => apiErr(ApiErrors.User.EmailAlreadyExists),
            UserUsernameAlreadyExists: () => apiErr(ApiErrors.User.UsernameAlreadyExists),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.me.updateUsername)
  @Auth()
  async updateUsername(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.updateUsername, async ({ body }) => {
      const result = await this.queryBus.execute(
        new UpdateUserMeUsernameCommand({
          userId: token.sub,
          newUsername: body.username,
        }),
      );

      return result.match(
        (user) =>
          apiOk(200, {
            me: this.dtoMapper.toUserForMeDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
            UserUsernameAlreadyExists: () => apiErr(ApiErrors.User.UsernameAlreadyExists),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.me.delete)
  @Auth()
  async deleteMe(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.delete, async () => {
      const result = await this.queryBus.execute(
        new DeleteUserMeCommand({
          userId: token.sub,
        }),
      );

      return result.match(
        () => apiOk(200, {}),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }
}
