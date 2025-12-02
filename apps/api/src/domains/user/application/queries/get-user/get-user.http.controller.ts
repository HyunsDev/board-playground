import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { GetUserQuery } from './get-user.query';

import { UserNotFoundError } from '@/domains/user/domain/user.errors';
import { UserDtoMapper } from '@/domains/user/interface/user.dto-mapper';

@Controller()
export class GetUserHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly userDtoMapper: UserDtoMapper,
  ) {}

  @TsRestHandler(contract.user.get)
  async getUser() {
    return tsRestHandler(contract.user.get, async ({ params }) => {
      const result = await this.queryBus.execute(new GetUserQuery(params.userId));

      return result.match(
        (user) =>
          ({
            status: 200,
            body: { user: this.userDtoMapper.toDto(user) },
          }) as const,
        (error) => {
          if (error instanceof UserNotFoundError) {
            return {
              status: 404,
              body: {
                ...EXCEPTION.USER.NOT_FOUND,
              },
            } as const;
          }
          throw error;
        },
      );
    });
  }
}
