import { Controller, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Response } from 'express';

import { contract } from '@workspace/contract';

import { LoginAuthCommand } from './login-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { IpAddress } from '@/shared/decorators/ip-address.decorator';
import { UserAgent } from '@/shared/decorators/user-agent.decorator';
import { mapDomainErrorToResponse } from '@/shared/utils/map-error-to-response';

@Controller()
export class LoginAuthHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<EnvSchema>,
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production', // HTTPS에서만 전송
      path: '/auth', // Refresh Token은 auth 관련 경로에서만 전송 (보안 강화)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
      sameSite: 'strict' as const,
    };
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
          res.cookie('refreshToken', data.refreshToken, this.getCookieOptions());
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
}
