import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { RefreshTokenEntity } from '../../domain/refresh-token.entity';
import { RefreshTokenRepositoryPort } from '../../domain/refresh-token.repository.port';
import {
  InvalidRefreshTokenError,
  SessionIsRevokedError,
  UsedRefreshTokenError,
} from '../../domain/session.errors';
import { SessionRepositoryPort } from '../../domain/session.repository.port';
import { REFRESH_TOKEN_REPOSITORY, SESSION_REPOSITORY } from '../../session.di-tokens';

import { TransactionManager } from '@/infra/database/transaction.manager';

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

  async rotate(oldHashedRefreshToken: string, newHashedRefreshToken: string) {
    const tokenResult =
      await this.refreshTokenRepo.getOneByHashedRefreshToken(oldHashedRefreshToken);
    if (tokenResult.isErr()) return err(tokenResult.error);

    const token = tokenResult.value;

    if (!token) {
      return err(new InvalidRefreshTokenError());
    }

    const sessionResult = await this.sessionRepo.getOneById(token.sessionId);
    if (sessionResult.isErr()) return err(sessionResult.error);
    const session = sessionResult.value;

    if (session.isRevoked) {
      return err(new SessionIsRevokedError());
    }

    if (token.isUsed) {
      session.revoke();
      await this.sessionRepo.save(session);
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

      await this.refreshTokenRepo.save(token);
      await this.refreshTokenRepo.save(newToken);

      session.updateLastUsedAt();
      await this.sessionRepo.save(session);

      return ok(newToken);
    });
  }

  async createNew(sessionId: string, hashedRefreshToken: string) {
    const newToken = RefreshTokenEntity.create({
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      sessionId: sessionId,
    });

    const saveResult = await this.refreshTokenRepo.save(newToken);
    if (saveResult.isErr()) {
      return err(saveResult.error);
    }

    return ok(saveResult.value);
  }
}
