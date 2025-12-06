import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, EXCEPTION } from '@workspace/contract';

import { LoginAuthCommand } from '../application/commands/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { UnexpectedDomainError } from '@/shared/base';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class AuthHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<EnvSchema>,
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      path: '/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict' as const,
    };
  }

  @TsRestHandler(contract.auth.register)
  async register(
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.register, async ({ body }) => {
      const result = await this.commandBus.execute(
        new RegisterAuthCommand({
          email: body.email,
          username: body.username,
          nickname: body.nickname,
          password: body.password,
          ipAddress: ipAddress,
          userAgent: ua,
        }),
      );

      return result.match(
        (data) => {
          void res.cookie('refreshToken', data.refreshToken, this.getCookieOptions());
          return apiOk(200, {
            accessToken: data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            UserEmailAlreadyExists: () => apiErr(EXCEPTION.USER.EMAIL_ALREADY_EXISTS),
            UserUsernameAlreadyExists: () => apiErr(EXCEPTION.USER.USERNAME_ALREADY_EXISTS),
            ValidationError: () => apiErr(EXCEPTION.COMMON.VALIDATION_ERROR),
          }),
      );
    });
  }

  @TsRestHandler(contract.auth.login)
  async login(
    @Res({ passthrough: true }) res: Response,
    @IpAddress() ipAddress: string,
    @UserAgent() ua: string,
  ) {
    return tsRestHandler(contract.auth.login, async ({ body }) => {
      const result = await this.commandBus.execute(
        new LoginAuthCommand({
          email: body.email,
          password: body.password,
          ipAddress: ipAddress,
          userAgent: ua,
        }),
      );

      return result.match(
        (data) => {
          void res.cookie('refreshToken', data.refreshToken, this.getCookieOptions());
          return apiOk(200, {
            accessToken: data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            InvalidCredentials: () => apiErr(EXCEPTION.AUTH.INVALID_CREDENTIALS),
          }),
      );
    });
  }

  @TsRestHandler(contract.auth.refreshToken)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return tsRestHandler(contract.auth.refreshToken, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiErr(EXCEPTION.AUTH.REFRESH_TOKEN_MISSING);
      }

      const result = await this.commandBus.execute(
        new RefreshTokenAuthCommand({
          refreshToken,
        }),
      );

      return result.match(
        (data) => {
          if (data.status === 'failed') {
            if (data.error.code === 'TokenReuseDetected') {
              void res.clearCookie('refreshToken', this.getCookieOptions());
              return apiErr(EXCEPTION.AUTH.REFRESH_TOKEN_REUSE_DETECTED);
            }
            throw new UnexpectedDomainError(data.error);
          }

          void res.cookie('refreshToken', data.data.refreshToken, this.getCookieOptions());
          return apiOk(200, {
            accessToken: data.data.accessToken,
          });
        },
        (error) =>
          matchPublicError(error, {
            InvalidRefreshToken: () => apiErr(EXCEPTION.AUTH.REFRESH_TOKEN_INVALID),
            SessionClosed: () => apiErr(EXCEPTION.AUTH.SESSION_CLOSED),
            SessionRevoked: () => apiErr(EXCEPTION.AUTH.SESSION_REVOKED),
            ExpiredToken: () => apiErr(EXCEPTION.AUTH.SESSION_EXPIRED),
          }),
      );
    });
  }

  @TsRestHandler(contract.auth.logout)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return tsRestHandler(contract.auth.logout, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return apiOk(204, null);
      }

      const result = await this.commandBus.execute(
        new LogoutAuthCommand({
          refreshToken: refreshToken,
        }),
      );

      void res.clearCookie('refreshToken', this.getCookieOptions());
      return result.match(
        () => apiOk(204, null),
        () => apiOk(204, null),
      );
    });
  }
}
