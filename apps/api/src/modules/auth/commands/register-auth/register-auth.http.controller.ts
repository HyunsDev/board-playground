import { Controller, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Response } from 'express';

import { contract } from '@workspace/contract';

import { RegisterAuthCommand } from './register-auth.command';

import { IpAddress } from '@/common/decorators/ip-address.decorator';
import { UserAgent } from '@/common/decorators/user-agent.decorator';
import { mapDomainErrorToResponse } from '@/common/utils/map-error-to-response';
import { EnvSchema } from '@/config/env.validation';

@Controller()
export class RegisterAuthHttpController {
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
