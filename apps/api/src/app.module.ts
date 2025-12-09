import { Module } from '@nestjs/common';

import { AuthModule } from './domains/auth/auth.module';
import { SessionModule } from './domains/session/session.module';
import { UserModule } from './domains/user/user.module';
import { CoreModule } from './infra/core.module';
import { DevtoolsModule } from './infra/devtools/devtools.module';
import { SecurityModule } from './infra/security/security.module';

@Module({
  imports: [
    CoreModule,
    SecurityModule,
    UserModule,
    SessionModule,
    AuthModule,
    ...(process.env.NODE_ENV === 'development' ? [DevtoolsModule] : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
