import { err, ok, Result } from 'neverthrow';
import { v7 } from 'uuid';

import { UsedRefreshTokenError } from './session.errors';

import { AggregateRoot, CommandMetadata } from '@/shared/base';

export interface RefreshTokenProps {
  id: string;
  token: string;
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

export class RefreshTokenEntity extends AggregateRoot<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: string) {
    super({
      id: id || props.id,
      props,
    });
  }

  public static create(
    createProps: CreateRefreshTokenProps,
    metadata?: CommandMetadata,
  ): RefreshTokenEntity {
    const id = v7();

    const props: RefreshTokenProps = {
      id,
      token: createProps.token,
      isUsed: false,
      expiresAt: createProps.expiresAt,
      sessionId: createProps.sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = new RefreshTokenEntity(props, id);
    return token;
  }

  get token(): string {
    return this.props.token;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  public use(): Result<void, UsedRefreshTokenError> {
    if (this.props.isUsed) {
      return err(new UsedRefreshTokenError());
    }
    this.props.isUsed = true;
    this.props.updatedAt = new Date();
    return ok(undefined);
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  isExpired(): boolean {
    return this.props.expiresAt <= new Date();
  }

  static reconstruct(props: RefreshTokenProps, id: string): RefreshTokenEntity {
    return new RefreshTokenEntity(props, id);
  }

  public validate(): void {}
}
