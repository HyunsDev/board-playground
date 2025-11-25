import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, EXCEPTION } from '@workspace/contract';

import { UserNotFoundException } from '../domain/user.exceptions';
import { GetUserQuery } from '../queries/get-user/get-user.query';
import { UserDtoMapper } from '../user.dto-mapper';

@Controller()
export class UserHttpController {
  constructor(
    private readonly commandBus: CommandBus,
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
          if (error instanceof UserNotFoundException) {
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
