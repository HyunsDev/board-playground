import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

import { EnvSchema } from '@/config/env.validation';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvSchema>) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
        } as JwtSignOptions,
      }),
    }),
  ],
  providers: [PasswordService, TokenService],
  controllers: [],
  exports: [PasswordService, TokenService],
})
export class AuthModule {}
