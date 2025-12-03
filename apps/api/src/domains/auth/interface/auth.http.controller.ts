import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, EXCEPTION } from '@workspace/contract';

import { LoginAuthCommand } from '../application/commands/login-auth/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth/register-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { InvalidRefreshTokenError } from '@/domains/session/domain/session.errors';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { mapDomainErrorToResponse } from '@/shared/utils/error-mapper';

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
          return {
            status: 200,
            body: {
              accessToken: data.accessToken,
            },
          } as const;
        },
        (err) => {
          return mapDomainErrorToResponse(err);
        },
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
          return {
            status: 200,
            body: {
              accessToken: data.accessToken,
            },
          } as const;
        },
        (err) => {
          return mapDomainErrorToResponse(err);
        },
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
          return { status: 200, body: { accessToken } };
        },
        (err) => {
          if (err instanceof InvalidRefreshTokenError) {
            void void res.clearCookie('refreshToken', this.getCookieOptions());
            return {
              status: 400,
              body: EXCEPTION.AUTH.INVALID_REFRESH_TOKEN,
            } as const;
          }

          void res.clearCookie('refreshToken', this.getCookieOptions());
          return mapDomainErrorToResponse(err);
        },
      );
    });
  }

  @TsRestHandler(contract.auth.logout)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return tsRestHandler(contract.auth.logout, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return {
          status: 204,
          body: null,
        } as const;
      }

      const result = await this.commandBus.execute(
        new LogoutAuthCommand({
          refreshToken: refreshToken,
        }),
      );

      return result.match(
        () => {
          void res.clearCookie('refreshToken', this.getCookieOptions());
          return {
            status: 204,
            body: null,
          } as const;
        },
        (err) => {
          return mapDomainErrorToResponse(err);
        },
      );
    });
  }
}
