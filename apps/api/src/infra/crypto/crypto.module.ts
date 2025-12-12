import { Module } from '@nestjs/common';

import { PasswordProvider } from './providers/password.provider';
import { RefreshTokenProvider } from './providers/refresh-token.provider';

@Module({
  providers: [PasswordProvider, RefreshTokenProvider],
  exports: [PasswordProvider, RefreshTokenProvider],
})
export class CryptoModule {}
