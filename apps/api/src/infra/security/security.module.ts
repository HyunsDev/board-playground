import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenProvider } from './token.provider';
import { TokenConfig, tokenConfig } from '../config/configs/token.config';

const services: Provider[] = [TokenProvider];
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
  providers: [...services, ...guards, ...strategies],
  controllers: [],
  exports: [TokenProvider, JwtModule],
})
export class SecurityModule {}
