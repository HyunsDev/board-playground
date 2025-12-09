import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { cookieConfig } from './configs/cookie.config';
import { databaseConfig } from './configs/database.config';
import { executionConfig } from './configs/execution.config';
import { tokenConfig } from './configs/token.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cookieConfig, executionConfig, tokenConfig], // Config Factory 로드
    }),
  ],
})
export class AppConfigModule {}
