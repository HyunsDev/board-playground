import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { err, ok } from 'neverthrow';

import { DevicePlatform } from '@workspace/contract';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { SESSION_REPOSITORY } from '../../session.constants';

import { TokenConfig, tokenConfig } from '@/infra/config/configs/token.config';
import { TokenProvider } from '@/infra/security/providers/token.provider';
import { UnexpectedDomainErrorException } from '@/shared/base';
import { matchError } from '@/shared/utils/match-error.utils';
import { matchType, typedOk } from '@/shared/utils/typed-ok.utils';

@Injectable()
export class SessionFacade {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly tokenProvider: TokenProvider,
    @Inject(tokenConfig.KEY)
    private readonly tokenConfig: TokenConfig,
  ) {}

  async getOneById(id: string) {
    return this.sessionRepo.getOneById(id);
  }

  getExpiresAtDate(): Date {
    const expirationDays = this.tokenConfig.refreshTokenExpirationDays;
    return dayjs().add(expirationDays, 'day').toDate();
  }

  async create(props: {
    userId: string;
    userAgent: string;
    platform: DevicePlatform;
    ipAddress: string;
  }) {
    const refreshTokenSet = this.tokenProvider.generateRefreshToken();
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
    const hashedRefreshToken = this.tokenProvider.hashRefreshToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    let session = sessionResult.value;

    const refreshTokenSet = this.tokenProvider.generateRefreshToken();
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
    // eslint-disable-next-line functional/no-expression-statements
    session = updatedSessionResult.value;

    return matchType(rotateResult.value, {
      success: () =>
        typedOk('rotated', {
          session: session,
          refreshToken: refreshTokenSet.refreshToken,
        }),
      revoked: () =>
        typedOk('revoked', {
          reason: 'TokenReuseDetected',
        }),
    });
  }

  async close(currentRefreshToken: string) {
    const hashedRefreshToken = this.tokenProvider.hashRefreshToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    const session = sessionResult.value;

    const closeResult = session.close();
    if (closeResult.isErr()) return closeResult;
    const updateResult = await this.sessionRepo.update(session);
    if (updateResult.isErr()) return updateResult;

    return ok(updateResult.value);
  }
}
