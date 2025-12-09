import { Controller, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Response } from 'express';

import { contract, ApiErrors } from '@workspace/contract';
import { TokenPayload } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { DeleteUserMeCommand } from '../application/commands/delete-user-me.command';
import { UpdateUserMeProfileCommand } from '../application/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommand } from '../application/commands/update-user-me-username.command';
import { GetUserMeQuery } from '../application/queries/get-user-me.query';

import { ContextService } from '@/infra/context/context.service';
import { Auth } from '@/infra/security/decorators/auth.decorator';
import { Token } from '@/infra/security/decorators/token.decorator';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/shared/constants/cookie.constant';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class UserMeHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.user.me.get)
  @Auth()
  async getMe(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.get, async () => {
      const result = await this.queryBus.execute(
        new GetUserMeQuery({ userId: token.sub }, this.contextService.getMessageMetadata()),
      );
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
      const result = await this.commandBus.execute(
        new UpdateUserMeProfileCommand(
          {
            userId: token.sub,
            nickname: body.nickname,
            bio: body.bio,
          },
          this.contextService.getMessageMetadata(),
        ),
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
      const result = await this.commandBus.execute(
        new UpdateUserMeUsernameCommand(
          {
            userId: token.sub,
            newUsername: body.username,
          },
          this.contextService.getMessageMetadata(),
        ),
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
  async deleteMe(@Res({ passthrough: true }) res: Response, @Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.delete, async () => {
      const result = await this.commandBus.execute(
        new DeleteUserMeCommand(
          {
            userId: token.sub,
          },
          this.contextService.getMessageMetadata(),
        ),
      );

      return result.match(
        () => {
          void res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
          return apiOk(200, {});
        },
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }
}
