import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor() {}

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
