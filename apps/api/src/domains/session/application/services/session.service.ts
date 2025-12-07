import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

import { DevicePlatform } from '@workspace/contract';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.constants';

import { EnvSchema } from '@/core/config/env.validation';
import { TokenService } from '@/infra/security/services/token.service';
import { UnexpectedDomainErrorException } from '@/shared/base';
import { matchError } from '@/shared/utils/match-error.utils';

@Injectable()
export class SessionService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<EnvSchema>,
  ) {}

  async getOneById(id: string) {
    return this.sessionRepo.getOneById(id);
  }

  getExpiresAtDate(): Date {
    const expirationDays = this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS');
    return dayjs().add(expirationDays, 'day').toDate();
  }

  async create(props: {
    userId: string;
    userAgent: string;
    platform: DevicePlatform;
    ipAddress: string;
  }) {
    const refreshTokenSet = this.tokenService.generateRefreshToken();
    const session = SessionEntity.create({
      userId: props.userId,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
      platform: props.platform,
      refreshTokenHash: refreshTokenSet.refreshTokenHash,
      expiresAt: this.getExpiresAtDate(),
    });
    return (await this.sessionRepo.create(session)).match(
      (data) =>
        ok({
          session: data,
          refreshToken: refreshTokenSet.refreshToken,
        }),
      (error) => err(error),
    );
  }

  async rotate(currentRefreshToken: string) {
    const hashedRefreshToken = this.tokenService.hashToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    const session = sessionResult.value;

    const refreshTokenSet = this.tokenService.generateRefreshToken();
    const rotateResult = session.rotateRefreshToken({
      currentTokenHash: hashedRefreshToken,
      newTokenHash: refreshTokenSet.refreshTokenHash,
      expiresAt: this.getExpiresAtDate(),
    });
    if (rotateResult.isErr()) return rotateResult;

    const updatedSessionResult = await this.sessionRepo.update(session);
    if (updatedSessionResult.isErr())
      return matchError(updatedSessionResult.error, {
        SessionNotFound: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      });

    if (rotateResult.value.status === 'success') {
      return ok({
        status: 'success' as const,
        data: {
          session: updatedSessionResult.value,
          refreshToken: refreshTokenSet.refreshToken,
        },
      });
    } else {
      return ok({
        status: 'failed' as const,
        error: rotateResult.value.error,
      });
    }
  }

  async close(currentRefreshToken: string) {
    const hashedRefreshToken = this.tokenService.hashToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    const session = sessionResult.value;

    const closeResult = session.close();
    if (closeResult.isErr()) return closeResult;
    const updateResult = await this.sessionRepo.update(session);
    if (updateResult.isErr()) return updateResult;

    return ok(null);
  }
}
