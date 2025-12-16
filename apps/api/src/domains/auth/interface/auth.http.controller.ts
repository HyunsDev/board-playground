import { Controller, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ContextService, Public, IpAddress, UserAgent } from '@workspace/backend-core';
import {
  apiOk,
  matchPublicError,
  apiErr,
  InvariantViolationException,
} from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';

import { LoginAuthCommand } from '../application/commands/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth.command';
import { CheckUsernameAvailableQuery } from '../application/queries/check-username-available.query';

import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/shared/constants/cookie.constant';

@Controller()
export class AuthHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly contextService: ContextService,
  ) {}

  @Public()
  @TsRestHandler(contract.auth.register)
  async register(
    @Res({ passthrough: true }) res: FastifyReply,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.register, async ({ body }) => {
      const result = await this.commandBus.execute(
        new RegisterAuthCommand(
          {
            email: body.email,
            username: body.username,
            nickname: body.nickname,
            password: body.password,
            ipAddress: ipAddress,
            userAgent: ua,
          },
          this.contextService.getMessageMetadata(),
        ),
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
            ValidationError: () => apiErr(ApiErrors.Common.ValidationError),
          }),
      );
    });
  }

  @Public()
  @TsRestHandler(contract.auth.login)
  async login(
    @Res({ passthrough: true }) res: FastifyReply,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.login, async ({ body }) => {
      const result = await this.commandBus.execute(
        new LoginAuthCommand(
          {
            email: body.email,
            password: body.password,
            ipAddress: ipAddress,
            userAgent: ua,
          },
          this.contextService.getMessageMetadata(),
        ),
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

  @Public()
  @TsRestHandler(contract.auth.refreshToken)
  async refreshToken(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    return tsRestHandler(contract.auth.refreshToken, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiErr(ApiErrors.Auth.RefreshTokenMissing);
      }

      const result = await this.commandBus.execute(
        new RefreshTokenAuthCommand(
          {
            refreshToken,
          },
          this.contextService.getMessageMetadata(),
        ),
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

  @Public()
  @TsRestHandler(contract.auth.logout)
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    return tsRestHandler(contract.auth.logout, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiOk(204, undefined);
      }

      const result = await this.commandBus.execute(
        new LogoutAuthCommand(
          {
            refreshToken: refreshToken,
          },
          this.contextService.getMessageMetadata(),
        ),
      );

      void res.clearCookie('refreshToken', { path: '/auth' });
      return result.match(
        () => apiOk(204, undefined),
        () => apiOk(204, undefined),
      );
    });
  }

  @Public()
  @TsRestHandler(contract.auth.checkUsername)
  async checkUsername() {
    return tsRestHandler(contract.auth.checkUsername, async ({ query }) => {
      const result = await this.queryBus.execute(
        new CheckUsernameAvailableQuery(
          {
            username: query.username,
          },
          this.contextService.getMessageMetadata(),
        ),
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
