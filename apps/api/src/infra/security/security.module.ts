import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordProvider } from './providers/password.provider';
import { TokenProvider } from './providers/token.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenConfig, tokenConfig } from '../config/configs/token.config';

const providers: Provider[] = [TokenProvider, PasswordProvider];
const guards: Provider[] = [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
];
const strategies: Provider[] = [JwtStrategy];

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [tokenConfig.KEY],
      useFactory: (tokenConfig: TokenConfig) => ({
        secret: tokenConfig.jwtAccessSecret,
        signOptions: {
          expiresIn: tokenConfig.jwtAccessExpirationTime,
        } as JwtSignOptions,
      }),
    }),
  ],
  providers: [...providers, ...guards, ...strategies],
  controllers: [],
  exports: [JwtModule, ...providers],
})
export class SecurityModule {}
