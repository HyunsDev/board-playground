import * as bcrypt from 'bcrypt';
import { err, ok, Result } from 'neverthrow';

import { passwordSchema } from '@workspace/contract';

import { InvalidCredentialsError } from '@/infra/security/domain/security.domain-errors';
import {
  DomainPrimitive,
  InternalServerErrorException,
  ValidationError,
  ValueObject,
} from '@/shared/base';

export class UserPasswordVO extends ValueObject<string> {
  // 1. 유효성 검증 (해시된 문자열이 비어있는지 등)
  protected validate(props: DomainPrimitive<string>): void {
    if (!props.value) {
      throw new InternalServerErrorException('Hashed password cannot be empty');
    }
  }

  static async create(plainText: string): Promise<Result<UserPasswordVO, ValidationError>> {
    const validationResult = passwordSchema.safeParse(plainText);
    if (validationResult.success === false) {
      return err(
        new ValidationError({
          headers: null,
          pathParams: null,
          query: null,
          body: validationResult.error.issues,
        }),
      );
    }

    const hashedPassword = await bcrypt.hash(plainText, 12);
    return ok(new UserPasswordVO({ value: hashedPassword }));
  }

  static fromHash(hashedPassword: string): UserPasswordVO {
    return new UserPasswordVO({ value: hashedPassword });
  }

  async compare(plainText: string) {
    const result = await bcrypt.compare(plainText, this.props.value);
    if (result === false) {
      return err(new InvalidCredentialsError());
    }
    return ok(null);
  }

  public toJSON(): string {
    return '*****'; // 절대 해시값을 내보내지 않음
  }

  public override toString(): string {
    return '*****';
  }
}
