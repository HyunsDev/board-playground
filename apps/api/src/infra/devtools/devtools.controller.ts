import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract } from '@workspace/contract';

import { EnvSchema } from '@/core/config/env.validation';
import { InternalServerErrorException } from '@/shared/base';

@Controller()
export class DevtoolsController {
  constructor(private readonly configService: ConfigService<EnvSchema>) {}

  @TsRestHandler(contract.devtools)
  async handler() {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new InternalServerErrorException(
        'Devtools are only available in development environment',
        'DEVTOOLS_ONLY_IN_DEVELOPMENT',
      );
    }

    return tsRestHandler(contract.devtools, {
      createUser: async ({ body }) => {
        // Implementation for creating a user in devtools
        return {
          status: 200,
          body: {} as any,
        } as const;
      },
      forceLogin: async ({ body }) => {
        // Implementation for forcing login in devtools
        return {
          status: 200,
          body: {} as any,
        } as const;
      },
    });
  }
}
