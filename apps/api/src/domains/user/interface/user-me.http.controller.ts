import { Controller, Res } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { FastifyReply } from 'fastify';

import {
  CommandDispatcherPort,
  MessageContext,
  QueryDispatcherPort,
  Token,
  Trigger,
} from '@workspace/backend-core';
import { apiOk, matchPublicError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TriggerCodeEnum } from '@workspace/domain';
import { TokenPayload } from '@workspace/domain';

import { UserDtoMapper } from './user.dto-mapper';
import { DeleteUserMeCommand } from '../application/me/commands/delete-user-me.command';
import { UpdateUserMeProfileCommand } from '../application/me/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommand } from '../application/me/commands/update-user-me-username.command';
import { GetUserMeQuery } from '../application/me/queries/get-user-me.query';

@Controller()
export class UserMeHttpController {
  constructor(
    private readonly commandDispatcher: CommandDispatcherPort,
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly dtoMapper: UserDtoMapper,

    private readonly messageContext: MessageContext,
  ) {}

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.user.me.get)
  async getMe(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.get, async () => {
      const result = await this.queryDispatcher.execute(new GetUserMeQuery({ userId: token.sub }));
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

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.user.me.updateProfile)
  async updateProfile(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.updateProfile, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new UpdateUserMeProfileCommand({
          userId: token.sub,
          nickname: body.nickname,
          bio: body.bio,
        }),
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

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.user.me.updateUsername)
  async updateUsername(@Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.updateUsername, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new UpdateUserMeUsernameCommand({
          userId: token.sub,
          newUsername: body.username,
        }),
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

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.user.me.delete)
  async deleteMe(@Res({ passthrough: true }) res: FastifyReply, @Token() token: TokenPayload) {
    return tsRestHandler(contract.user.me.delete, async () => {
      const result = await this.commandDispatcher.execute(
        new DeleteUserMeCommand({
          userId: token.sub,
        }),
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
