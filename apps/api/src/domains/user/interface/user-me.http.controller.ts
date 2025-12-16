import { Controller, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { FastifyReply } from 'fastify';

import { ContextService, Token } from '@workspace/backend-core';
import { apiOk, matchPublicError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TokenPayload } from '@workspace/domain';

import { UserDtoMapper } from './user.dto-mapper';
import { DeleteUserMeCommand } from '../application/me/commands/delete-user-me.command';
import { UpdateUserMeProfileCommand } from '../application/me/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommand } from '../application/me/commands/update-user-me-username.command';
import { GetUserMeQuery } from '../application/me/queries/get-user-me.query';

@Controller()
export class UserMeHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.user.me.get)
  async getMe(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.get, async () => {
      const result = await this.queryBus.execute(
        new GetUserMeQuery({ userId: token.sub }, this.contextService.getMessageMetadata()),
      );
      return result.match(
        (user) =>
          apiOk(200, {
            me: this.dtoMapper.toPrivateProfileDto(user),
          }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.me.updateProfile)
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
            me: this.dtoMapper.toPrivateProfileDto(user),
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
            me: this.dtoMapper.toPrivateProfileDto(user),
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
  async deleteMe(@Res({ passthrough: true }) res: FastifyReply, @Token() token: TokenPayload) {
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
          void res.clearCookie('refreshToken', { path: '/auth' });
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
