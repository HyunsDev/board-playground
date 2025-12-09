import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordProvider {
  async hash(plainText: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(plainText, saltRounds);
  }

  async compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}
