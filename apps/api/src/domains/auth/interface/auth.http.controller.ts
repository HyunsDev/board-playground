import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, EXCEPTION } from '@workspace/contract';

import {
  LoginAuthCommand,
  LoginAuthCommandResult,
} from '../application/commands/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { matchError, matchPublicError } from '@/shared/utils/match-error.utils';

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
      const result = await this.commandBus.execute<LoginAuthCommandResult>(
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
        return {
          status: 401,
          body: EXCEPTION.AUTH.MISSING_TOKEN,
        } as const;
      }

      const result = await this.commandBus.execute(
        new RefreshTokenAuthCommand({
          refreshToken: refreshToken,
        }),
      );

      return result.match(
        ({ accessToken, refreshToken: newRefreshToken }) => {
          void res.cookie('refreshToken', newRefreshToken, this.getCookieOptions());
          return apiOk(200, { accessToken });
        },
        (error) => {
          void res.clearCookie('refreshToken', this.getCookieOptions());
          return matchError(error, {
            InvalidRefreshToken: () => apiErr(EXCEPTION.AUTH.INVALID_REFRESH_TOKEN),
            SessionIsRevoked: () => apiErr(EXCEPTION.AUTH.SESSION_IS_REVOKED),
            UsedRefreshToken: () => apiErr(EXCEPTION.AUTH.USED_REFRESH_TOKEN),
            UserNotFound: () => apiErr(EXCEPTION.USER.NOT_FOUND),
          });
        },
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
        () => {
          return apiOk(204, null);
        },
        (err) => matchError(err, {}),
      );
    });
  }
}
