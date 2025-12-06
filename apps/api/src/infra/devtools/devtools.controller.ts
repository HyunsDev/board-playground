import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { ForceLoginCommand } from './commands/force-login.command';
import { ForceRegisterCommand } from './commands/force-register.command';
import { ResetDbCommand } from './commands/reset-db.command';

import { EnvSchema } from '@/core/config/env.validation';
import { apiErr, apiOk, InternalServerError } from '@/shared/base';
import { DomainException } from '@/shared/base/error/base.domain-exception';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class DevtoolsController {
  constructor(
    private readonly configService: ConfigService<EnvSchema>,
    private readonly commandBus: CommandBus,
  ) {}

  @TsRestHandler(contract.devtools)
  async handler() {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new DomainException(
        new InternalServerError('Devtools are only available in development environment'),
      );
    }

    return tsRestHandler(contract.devtools, {
      forceRegister: async ({ body }) => {
        const result = await this.commandBus.execute(
          new ForceRegisterCommand({
            email: body.email,
            username: body.username,
            nickname: body.nickname,
          }),
        );
        return result.match(
          (tokens) => apiOk(200, tokens),
          (error) =>
            matchPublicError(error, {
              UserEmailAlreadyExists: () => apiErr(EXCEPTION.USER.EMAIL_ALREADY_EXISTS),
              UserUsernameAlreadyExists: () => apiErr(EXCEPTION.USER.USERNAME_ALREADY_EXISTS),
            }),
        );
      },
      forceLogin: async ({ body }) => {
        const result = await this.commandBus.execute(
          new ForceLoginCommand({
            email: body.email,
          }),
        );
        return result.match(
          (tokens) => apiOk(200, tokens),
          (error) =>
            matchPublicError(error, {
              UserNotFound: () => apiErr(EXCEPTION.USER.NOT_FOUND),
            }),
        );
      },
      resetDB: async () => {
        const result = await this.commandBus.execute(new ResetDbCommand());
        return result.match(
          () => apiOk(200, undefined),
          () => null,
        );
      },
    });
  }
}
