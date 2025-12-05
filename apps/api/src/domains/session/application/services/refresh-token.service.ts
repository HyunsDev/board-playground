import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { RefreshTokenEntity } from '../../domain/refresh-token.entity';
import { RefreshTokenRepositoryPort } from '../../domain/refresh-token.repository.port';
import { SessionIsRevokedError, SessionNotFoundError } from '../../domain/session.domain-errors';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { InvalidRefreshTokenError, UsedRefreshTokenError } from '../../domain/token.domain-errors';
import { REFRESH_TOKEN_REPOSITORY, SESSION_REPOSITORY } from '../../session.di-tokens';

import { TransactionManager } from '@/infra/database/transaction.manager';
import { ExtractPublicDomainError } from '@/shared/base/interface/api-error.types';
import { InferErr } from '@/shared/types/infer-err.type';
import { DomainResult } from '@/shared/types/result.type';
import { matchError } from '@/shared/utils/match-error.utils';

export type RotateTokenResult = DomainResult<
  RefreshTokenEntity,
  Exclude<
    ExtractPublicDomainError<
      | InferErr<RefreshTokenRepositoryPort['getOneByHashedRefreshToken']>
      | InferErr<SessionRepositoryPort['getOneById']>
      | InferErr<RefreshTokenRepositoryPort['update']>
      | InferErr<SessionRepositoryPort['update']>
      | SessionIsRevokedError
      | UsedRefreshTokenError
    >,
    SessionNotFoundError
  >
>;

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepositoryPort,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,
    private readonly txManager: TransactionManager,
  ) {}

  async getOneByHashedRefreshToken(hashedRefreshToken: string) {
    return this.refreshTokenRepo.getOneByHashedRefreshToken(hashedRefreshToken);
  }

  async rotate(
    oldHashedRefreshToken: string,
    newHashedRefreshToken: string,
  ): Promise<RotateTokenResult> {
    const tokenResult =
      await this.refreshTokenRepo.getOneByHashedRefreshToken(oldHashedRefreshToken);
    if (tokenResult.isErr()) return err(tokenResult.error);

    const token = tokenResult.value;

    if (!token) {
      return err(new InvalidRefreshTokenError());
    }

    const sessionResult = await this.sessionRepo.getOneById(token.sessionId);
    if (sessionResult.isErr()) {
      return matchError(sessionResult.error, {
        SessionNotFound: () => err(new InvalidRefreshTokenError()),
      });
    }
    const session = sessionResult.value;

    if (session.isRevoked) {
      return err(new SessionIsRevokedError());
    }

    if (token.isUsed) {
      session.revoke();
      const saveSessionRes = await this.sessionRepo.update(session);
      if (saveSessionRes.isErr()) {
        return matchError(saveSessionRes.error, {
          SessionNotFound: () => err(new InvalidRefreshTokenError()),
        });
      }
      return err(new UsedRefreshTokenError());
    }

    if (token.isExpired()) {
      return err(new InvalidRefreshTokenError());
    }

    return this.txManager.run(async () => {
      const tokenUseResult = token.use();
      if (tokenUseResult.isErr()) {
        return err(tokenUseResult.error);
      }

      const newToken = RefreshTokenEntity.create({
        token: newHashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sessionId: session.id,
      });

      const saveOldTokenRes = await this.refreshTokenRepo.update(token);
      if (saveOldTokenRes.isErr()) {
        return matchError(saveOldTokenRes.error, {
          RefreshTokenNotFound: () => err(new InvalidRefreshTokenError()),
        });
      }

      const saveNewTokenRes = await this.refreshTokenRepo.create(newToken);
      if (saveNewTokenRes.isErr()) {
        return err(saveNewTokenRes.error);
      }

      session.updateLastUsedAt();
      const saveSessionRes = await this.sessionRepo.update(session);
      if (saveSessionRes.isErr()) {
        return matchError(saveSessionRes.error, {
          SessionNotFound: () => err(new InvalidRefreshTokenError()),
        });
      }

      return ok(newToken);
    });
  }

  async createNew(sessionId: string, hashedRefreshToken: string) {
    const newToken = RefreshTokenEntity.create({
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      sessionId: sessionId,
    });

    return (await this.refreshTokenRepo.create(newToken)).match(
      (savedToken) => ok(savedToken),
      (err) => matchError(err, {}),
    );
  }
}
