import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { AuthModule } from './domains/auth/auth.module';
import { BoardModule } from './domains/board/board.module';
import { ManagerModule } from './domains/manager/manager.module';
import { SessionModule } from './domains/session/session.module';
import { TestModule } from './domains/test/test.module';
import { UserModule } from './domains/user/user.module';
import { DevtoolsModule } from './infra/devtools/devtools.module';

@Module({
  imports: [
    CoreModule,
    UserModule,
    SessionModule,
    AuthModule,

    BoardModule,
    ManagerModule,

    ...(process.env.NODE_ENV === 'development' ? [TestModule] : []),
    ...(process.env.NODE_ENV === 'development' ? [DevtoolsModule] : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
