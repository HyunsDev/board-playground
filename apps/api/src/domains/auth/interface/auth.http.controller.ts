import { Controller, Req, Res } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { FastifyReply, FastifyRequest } from 'fastify';

import {
  Public,
  MessageContext,
  QueryDispatcherPort,
  CommandDispatcherPort,
  Trigger,
} from '@workspace/backend-core';
import {
  apiOk,
  matchPublicError,
  apiErr,
  InvariantViolationException,
} from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TriggerCodeEnum } from '@workspace/domain';

import { LogoutAuthCommand } from '../application/common/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/common/commands/refresh-token-auth.command';
import { CheckUsernameAvailableQuery } from '../application/common/queries/check-username-available.query';

import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/shared/constants/cookie.constant';

@Controller()
export class AuthHttpController {
  constructor(
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly commandDispatcher: CommandDispatcherPort,
    private readonly messageContext: MessageContext,
  ) {}

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.refresh)
  async refresh(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    return tsRestHandler(contract.auth.refresh, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiErr(ApiErrors.Auth.RefreshTokenMissing);
      }

      const result = await this.commandDispatcher.execute(
        new RefreshTokenAuthCommand({
          refreshToken,
        }),
      );

      return result.match(
        (data) => {
          if (data.type === 'revoked') {
            if (data.reason === 'TokenReuseDetected') {
              void res.clearCookie('refreshToken', { path: '/auth' });
              return apiErr(ApiErrors.Auth.RefreshTokenReuseDetected);
            }
            throw new InvariantViolationException();
          }

          void res.setCookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
          return apiOk(200, {
            accessToken: data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            InvalidRefreshToken: () => apiErr(ApiErrors.Auth.RefreshTokenInvalid),
            SessionClosed: () => apiErr(ApiErrors.Auth.SessionClosed),
            SessionRevoked: () => apiErr(ApiErrors.Auth.SessionRevoked),
            ExpiredToken: () => apiErr(ApiErrors.Auth.SessionExpired),
          }),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.logout)
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    return tsRestHandler(contract.auth.logout, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiOk(204, undefined);
      }

      const result = await this.commandDispatcher.execute(
        new LogoutAuthCommand({
          refreshToken: refreshToken,
        }),
      );

      void res.clearCookie('refreshToken', { path: '/auth' });
      return result.match(
        () => apiOk(204, undefined),
        () => apiOk(204, undefined),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @Public()
  @TsRestHandler(contract.auth.checkUsernameAvailability)
  async checkUsernameAvailability() {
    return tsRestHandler(contract.auth.checkUsernameAvailability, async ({ query }) => {
      const result = await this.queryDispatcher.execute(
        new CheckUsernameAvailableQuery({
          username: query.username,
        }),
      );

      return result.match(
        () =>
          apiOk(200, {
            available: true,
          }),
        (error) =>
          matchPublicError(error, {
            UserUsernameAlreadyExists: () =>
              apiOk(200, {
                available: false,
              }),
          }),
      );
    });
  }
}
