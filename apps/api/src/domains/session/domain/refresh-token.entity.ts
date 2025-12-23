import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { BaseEntity, BaseEntityProps } from '@workspace/backend-core';
import { ExpiredTokenError } from '@workspace/backend-ddd';

import { TokenReuseDetectedError } from './token.domain-errors';

export interface RefreshTokenProps extends BaseEntityProps {
  id: string;
  hashedToken: string;
  isUsed: boolean;
  expiresAt: Date;
  sessionId: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRefreshTokenProps {
  token: string;
  expiresAt: Date;
  sessionId: string;
}

export class RefreshTokenEntity extends BaseEntity<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super({
      id: props.id || v7(),
      props,
    });
  }

  public static create(createProps: CreateRefreshTokenProps): RefreshTokenEntity {
    const id = v7();
    const props: RefreshTokenProps = {
      id,
      hashedToken: createProps.token,
      isUsed: false,
      expiresAt: createProps.expiresAt,
      sessionId: createProps.sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const token = new RefreshTokenEntity(props);
    return token;
  }

  get token(): string {
    return this.props.hashedToken;
  }

  public use() {
    if (this.props.isUsed) {
      return err(new TokenReuseDetectedError());
    }
    if (this.isExpired()) {
      return err(new ExpiredTokenError());
    }
    this.props.isUsed = true;
    this.props.updatedAt = new Date();
    return ok(undefined);
  }

  private isExpired(): boolean {
    return this.props.expiresAt <= new Date();
  }

  static reconstruct(props: RefreshTokenProps): RefreshTokenEntity {
    return new RefreshTokenEntity(props);
  }

  public validate(): void {}
}
