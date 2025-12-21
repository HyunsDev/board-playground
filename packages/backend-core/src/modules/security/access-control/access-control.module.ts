import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AccessTokenProvider } from './providers/access-token.provider';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AccessTokenConfig, accessTokenConfig } from '@/modules/foundation/config';

const globalAuthGuard: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
];

export interface SecurityModuleOptions {
  enableGlobalAuthGuard?: boolean;
}

@Module({})
export class AccessControlModule {
  static forRoot(options: SecurityModuleOptions = {}): DynamicModule {
    const { enableGlobalAuthGuard = true } = options;

    const guards: Provider[] = [];
    const guardExports: Provider[] = [];
    if (enableGlobalAuthGuard) {
      guards.push(...globalAuthGuard);
    } else {
      guards.push(JwtAuthGuard, RolesGuard);
      guardExports.push(JwtAuthGuard, RolesGuard);
    }

    return {
      module: AccessControlModule,
      imports: [
        PassportModule,
        JwtModule.registerAsync({
          inject: [accessTokenConfig.KEY],
          useFactory: (config: AccessTokenConfig) => ({
            secret: config.jwtAccessSecret,
            signOptions: {
              expiresIn: config.jwtAccessExpirationTime,
            } as JwtSignOptions,
          }),
        }),
      ],
      providers: [AccessTokenProvider, JwtStrategy, ...guards],
      controllers: [],
      exports: [JwtModule, AccessTokenProvider, ...guardExports],
    };
  }
}
