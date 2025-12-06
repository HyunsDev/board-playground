import { Injectable } from '@nestjs/common';
import { ok } from 'neverthrow';

import { DevicePlatform } from '@workspace/contract';

import { RefreshTokenService } from '@/domains/session/application/services/refresh-token.service';
import { SessionService } from '@/domains/session/application/services/session.service';
import { UserEntity } from '@/domains/user/domain/user.entity';
import { TokenService } from '@/infra/security/services/token.service';
import { matchError } from '@/shared/utils/match-error.utils';

interface IssueTokenDto {
  user: UserEntity;
  device: {
    ipAddress: string;
    userAgent: string;
    platform: DevicePlatform; // 혹은 string
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly tokenService: TokenService,
  ) {}

  async issue({ user, device }: IssueTokenDto) {
    const refreshTokens = this.tokenService.generateRefreshToken();

    const createSessionResult = await this.sessionService.create({
      userId: user.id,
      ipAddress: device.ipAddress,
      userAgent: device.userAgent,
      platform: device.platform,
    });
    if (createSessionResult.isErr()) {
      return matchError(createSessionResult.error, {});
    }
    const session = createSessionResult.value;

    const createRefreshTokenResult = await this.refreshTokenService.createNew(
      session.id,
      refreshTokens.hashedRefreshToken,
    );
    if (createRefreshTokenResult.isErr()) {
      return matchError(createRefreshTokenResult.error, {});
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      sessionId: session.id,
    });

    return ok<AuthTokens>({
      accessToken,
      refreshToken: refreshTokens.refreshToken,
    });
  }
}
