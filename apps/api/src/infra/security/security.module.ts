import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenConfig, tokenConfig } from '../config/configs/token.config';

const services: Provider[] = [TokenService];
const guards: Provider[] = [JwtAuthGuard, RolesGuard];
const strategies: Provider[] = [JwtStrategy];

@Global()
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
  exports: [...services],
})
export class SecurityModule {}
