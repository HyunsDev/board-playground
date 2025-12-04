import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract } from '@workspace/contract';

import { EnvSchema } from '@/core/config/env.validation';
import { InternalServerError } from '@/shared/base';
import { DomainException } from '@/shared/base/error/base.domain-exception';

@Controller()
export class DevtoolsController {
  constructor(private readonly configService: ConfigService<EnvSchema>) {}

  @TsRestHandler(contract.devtools)
  async handler() {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new DomainException(
        new InternalServerError({
          message: 'Devtools are only available in development environment',
        }),
      );
    }

    return tsRestHandler(contract.devtools, {
      createUser: async () => {
        // Implementation for creating a user in devtools
        return {
          status: 200,
          body: {} as any,
        } as const;
      },
      forceLogin: async () => {
        // Implementation for forcing login in devtools
        return {
          status: 200,
          body: {} as any,
        } as const;
      },
    });
  }
}
