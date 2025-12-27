import { Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { ok, Result, ResultAsync } from 'neverthrow';

import {
  matchError,
  matchType,
  typedOk,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { DevicePlatform } from '@workspace/contract';
import { SessionId } from '@workspace/domain';

import { SessionEntity } from '../../domain/session.entity';
import { SessionRepositoryPort } from '../../domain/session.repository.port';

import { RefreshTokenConfig, refreshTokenConfig } from '@/core/configs/refresh-token.config';
import { RefreshTokenProvider } from '@/infra/crypto';

@Injectable()
export class SessionFacade {
  constructor(
    private readonly sessionRepo: SessionRepositoryPort,
    private readonly refreshTokenProvider: RefreshTokenProvider,
    @Inject(refreshTokenConfig.KEY)
    private readonly tokenConfig: RefreshTokenConfig,
  ) {}

  async getOneById(id: SessionId) {
    return this.sessionRepo.getOneById(id);
  }

  create(props: {
    userId: UserId;
    userAgent: string;
    platform: DevicePlatform;
    ipAddress: string;
  }) {
    const refreshTokenSet = this.refreshTokenProvider.generateRefreshToken();
    const session = SessionEntity.create({
      userId: props.userId,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
      platform: props.platform,
      refreshTokenHash: refreshTokenSet.refreshTokenHash,
      expiresAt: this.getExpiresAtDate(),
    });
    return this.sessionRepo.create(session).map((data) => ({
      session: data,
      refreshToken: refreshTokenSet.refreshToken,
    }));
  }

  async rotate(currentRefreshToken: string) {
    const hashedRefreshToken = this.refreshTokenProvider.hashRefreshToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    let session = sessionResult.value;

    const refreshTokenSet = this.refreshTokenProvider.generateRefreshToken();
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
    const hashedRefreshToken = this.refreshTokenProvider.hashRefreshToken(currentRefreshToken);
    const sessionResult = await this.sessionRepo.getOneByHashedRefreshToken(hashedRefreshToken);
    if (sessionResult.isErr()) return sessionResult;
    const session = sessionResult.value;

    const closeResult = session.close();
    if (closeResult.isErr()) return closeResult;
    const updateResult = await this.sessionRepo.update(session);
    if (updateResult.isErr()) return updateResult;

    return ok(updateResult.value);
  }

  closeAllActives(userId: UserId, exceptSessionId?: SessionId) {
    return this.sessionRepo
      .listActiveByUserId(userId)
      .map((sessions) => sessions.filter((s) => s.id !== exceptSessionId))
      .andThen((sessions) => Result.combine(sessions.map((session) => session.close())))
      .andThen((sessions) =>
        ResultAsync.combine(sessions.map((session) => this.sessionRepo.update(session))),
      )
      .mapErr((error) =>
        matchError(error, {
          SessionNotFound: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
          SessionClosed: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
          SessionRevoked: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
      );
  }

  private getExpiresAtDate(): Date {
    const expirationDays = this.tokenConfig.refreshTokenExpirationDays;
    return dayjs().add(expirationDays, 'day').toDate();
  }
}
