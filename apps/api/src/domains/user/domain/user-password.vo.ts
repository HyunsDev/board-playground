import { DomainPrimitive, InternalServerErrorException } from '@workspace/backend-ddd';

import { BaseValueObject } from '@/shared/base';

export class UserPasswordVO extends BaseValueObject<string> {
  // 1. 유효성 검증 (해시된 문자열이 비어있는지 등)
  protected validate(props: DomainPrimitive<string>): void {
    if (!props.value) {
      throw new InternalServerErrorException('Hashed password cannot be empty');
    }
  }

  static fromHash(hashedPassword: string): UserPasswordVO {
    return new UserPasswordVO({ value: hashedPassword });
  }

  get hashedValue(): string {
    return this.props.value;
  }

  public toJSON(): string {
    return '*****'; // 절대 해시값을 내보내지 않음
  }

  public override toString(): string {
    return '*****';
  }
}
