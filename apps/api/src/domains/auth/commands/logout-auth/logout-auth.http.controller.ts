import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract } from '@workspace/contract';

import { LogoutAuthCommand } from './logout-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { mapDomainErrorToResponse } from '@/shared/utils/map-error-to-response';

@Controller()
export class LogoutAuthHttpController {
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

  @TsRestHandler(contract.auth.logout)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return tsRestHandler(contract.auth.logout, async () => {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        return {
          status: 200,
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
          res.clearCookie('refreshToken', this.getCookieOptions());
          return {
            status: 200,
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
