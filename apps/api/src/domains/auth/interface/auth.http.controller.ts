import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, ApiErrors } from '@workspace/contract';

import { LoginAuthCommand } from '../application/commands/login-auth.command';
import { LogoutAuthCommand } from '../application/commands/logout-auth.command';
import { RefreshTokenAuthCommand } from '../application/commands/refresh-token-auth.command';
import { RegisterAuthCommand } from '../application/commands/register-auth.command';
import { CheckUsernameAvailableQuery } from '../application/queries/check-username-available.query';

import { EnvSchema } from '@/core/config/env.validation';
import { ContextService } from '@/infra/context/context.service';
import { UnexpectedDomainError } from '@/shared/base';
import { apiErr, apiOk } from '@/shared/base/interface/response.utils';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class AuthHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<EnvSchema>,
    private readonly contextService: ContextService,
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
          void res.cookie('refreshToken', data.refreshToken, this.getCookieOptions());
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
          void res.cookie('refreshToken', data.refreshToken, this.getCookieOptions());
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
          if (data.status === 'failed') {
            if (data.error.code === 'TokenReuseDetected') {
              void res.clearCookie('refreshToken', this.getCookieOptions());
              return apiErr(ApiErrors.Auth.RefreshTokenReuseDetected);
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
            InvalidRefreshToken: () => apiErr(ApiErrors.Auth.RefreshTokenInvalid),
            SessionClosed: () => apiErr(ApiErrors.Auth.SessionClosed),
            SessionRevoked: () => apiErr(ApiErrors.Auth.SessionRevoked),
            ExpiredToken: () => apiErr(ApiErrors.Auth.SessionExpired),
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
        new LogoutAuthCommand(
          {
            refreshToken: refreshToken,
          },
          this.contextService.getMessageMetadata(),
        ),
      );

      void res.clearCookie('refreshToken', this.getCookieOptions());
      return result.match(
        () => apiOk(204, null),
        () => apiOk(204, null),
      );
    });
  }

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
