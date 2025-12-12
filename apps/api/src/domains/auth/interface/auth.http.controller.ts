import { Controller, Req, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, ApiErrors } from '@workspace/contract';

import { LoginAuthCommand } from '../application/commands/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth.command';
import { CheckUsernameAvailableQuery } from '../application/queries/check-username-available.query';

import { ContextService } from '@/infra/context/context.service';
import { Public } from '@/infra/security/decorators/public.decorator';
import { InvariantViolationException } from '@/shared/base';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '@/shared/constants/cookie.constant';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { matchPublicError } from '@/shared/utils/match-error.utils';

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
    @Res({ passthrough: true }) res: Response,
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
          void res.cookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
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
    @Res({ passthrough: true }) res: Response,
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
          void res.cookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
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
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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
              void res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
              return apiErr(ApiErrors.Auth.RefreshTokenReuseDetected);
            }
            throw new InvariantViolationException();
          }

          void res.cookie('refreshToken', data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
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
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
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

      void res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
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
