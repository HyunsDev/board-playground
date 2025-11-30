import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { AuthModule } from './domains/auth/auth.module';
import { DeviceModule } from './domains/device/device.module';
import { HelloModule } from './domains/hello/hello.module';
import { UserModule } from './domains/user/user.module';
import { ContextModule } from './infra/context/context.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { SecurityModule } from './infra/security/security.module';

@Module({
  imports: [
    CoreModule,
    ContextModule,
    PrismaModule,
    SecurityModule,
    HelloModule,
    UserModule,
    DeviceModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
