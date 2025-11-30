import { Controller, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Request, Response } from 'express';

import { contract, EXCEPTION } from '@workspace/contract';

import { RefreshTokenAuthCommand } from './refresh-token-auth.command';

import { EnvSchema } from '@/core/config/env.validation';
import { mapDomainErrorToResponse } from '@/shared/utils/map-error-to-response';

@Controller()
export class RefreshTokenAuthHttpController {
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
          res.cookie('refreshToken', newRefreshToken, this.getCookieOptions());
          return { status: 200, body: { accessToken } };
        },
        (err) => {
          res.clearCookie('refreshToken', this.getCookieOptions());
          return mapDomainErrorToResponse(err);
        },
      );
    });
  }
}
