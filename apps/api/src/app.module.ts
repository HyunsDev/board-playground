import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { AuthModule } from './domains/auth/auth.module';
import { SessionModule } from './domains/session/session.module';
import { UserModule } from './domains/user/user.module';
import { ContextModule } from './infra/context/context.module';
import { DatabaseModule } from './infra/database/database.module';
import { DevtoolsModule } from './infra/devtools/devtools.module';
import { SecurityModule } from './infra/security/security.module';

@Module({
  imports: [
    CoreModule,
    ContextModule,
    DatabaseModule,
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
