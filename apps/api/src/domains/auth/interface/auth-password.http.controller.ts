import { Controller, Res } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { FastifyReply } from 'fastify';

import {
  Public,
  IpAddress,
  UserAgent,
  CommandDispatcherPort,
  Trigger,
  Token,
} from '@workspace/backend-core';
import {
  apiOk,
  matchPublicError,
  apiErr,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TokenPayload, TriggerCodeEnum } from '@workspace/domain';

import { ChangePasswordCommand } from '../application/password/commands/change-password.command';
import { LoginWithPasswordCommand } from '../application/password/commands/login-with-password.command';
import { RegisterAuthCommand } from '../application/password/commands/register-auth.command';
import { SendVerificationEmailCommand } from '../application/password/commands/send-verification-email.command';

import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/shared/constants/cookie.constant';

@Controller()
export class AuthPasswordHttpController {
  constructor(private readonly commandDispatcher: CommandDispatcherPort) {}

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.password.sendVerificationEmail)
  async sendVerificationEmail() {
    return tsRestHandler(contract.auth.password.sendVerificationEmail, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new SendVerificationEmailCommand({
          email: body.email,
        }),
      );

      return result.match(
        () => apiOk(204, undefined),
        (error) => matchPublicError(error, {}),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.password.register)
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.password.register, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new RegisterAuthCommand({
          email: body.email,
          username: body.username,
          nickname: body.nickname,
          password: body.password,
          ipAddress: ipAddress,
          userAgent: ua,
          emailVerificationCode: body.emailVerificationCode,
        }),
      );

      return result.match(
        (data) => {
          void res.setCookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
          return apiOk(200, {
            accessToken: data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            UserEmailAlreadyExists: () => apiErr(ApiErrors.User.EmailAlreadyExists),
            UserUsernameAlreadyExists: () => apiErr(ApiErrors.User.UsernameAlreadyExists),
            InvalidEmailVerificationCode: () => apiErr(ApiErrors.Auth.InvalidEmailVerificationCode),
            ValidationError: () => apiErr(ApiErrors.Common.ValidationError),
          }),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.password.login)
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.password.login, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new LoginWithPasswordCommand({
          email: body.email,
          password: body.password,
          ipAddress: ipAddress,
          userAgent: ua,
        }),
      );

      return result.match(
        (data) => {
          void res.setCookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
          return apiOk(200, {
            accessToken: data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            InvalidCredentials: () => apiErr(ApiErrors.Auth.InvalidCredentials),
          }),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.auth.password.change)
  async changePassword(@Token() token: TokenPayload) {
    return tsRestHandler(contract.auth.password.change, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new ChangePasswordCommand({
          userId: token.sub,
          oldPassword: body.oldPassword,
          newPassword: body.newPassword,
          logoutAllSessions: body.logoutAllSessions ?? true,
          currentSessionId: token.sessionId,
        }),
      );

      return result.match(
        () => apiOk(204, undefined),
        (error) =>
          matchPublicError(error, {
            InvalidCredentials: () => apiErr(ApiErrors.Auth.InvalidCredentials),
            ValidationError: () => apiErr(ApiErrors.Common.ValidationError),
            UserNotFound: (e) => {
              throw new UnexpectedDomainErrorException(e);
            },
          }),
      );
    });
  }
}
