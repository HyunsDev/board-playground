import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { EnvSchema } from '@/config/env.validation';

const services: Provider[] = [PasswordService, TokenService];
const guards: Provider[] = [JwtAuthGuard, RolesGuard];
const strategies: Provider[] = [JwtStrategy];

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRATION_TIME'),
        } as JwtSignOptions,
      }),
    }),
  ],
  providers: [...services, ...guards, ...strategies],
  controllers: [],
  exports: [...services],
})
export class AuthModule {}
