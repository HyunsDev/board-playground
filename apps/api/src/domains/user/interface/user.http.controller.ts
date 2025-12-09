import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { contract, ApiErrors, PaginationMeta } from '@workspace/contract';

import { UserDtoMapper } from './user.dto-mapper';
import { GetUserQuery } from '../application/queries/get-user.query';
import { SearchUserQuery } from '../application/queries/search-user.query';
import { UserEntity } from '../domain/user.entity';

import { ContextService } from '@/infra/context/context.service';
import { Auth } from '@/infra/security/decorators/auth.decorator';
import { apiErr, apiOk } from '@/shared/base';
import { matchPublicError } from '@/shared/utils/match-error.utils';

@Controller()
export class UserHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly dtoMapper: UserDtoMapper,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.user.get)
  @Auth()
  async getUser() {
    return tsRestHandler(contract.user.get, async ({ params }) => {
      const result = await this.queryBus.execute(
        new GetUserQuery({ userId: params.userId }, this.contextService.getMessageMetadata()),
      );

      return result.match(
        (user) => apiOk(200, { user: this.dtoMapper.toPublicProfileDto(user) }),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }

  @TsRestHandler(contract.user.search)
  @Auth()
  async searchUsers() {
    return tsRestHandler(contract.user.search, async ({ query }) => {
      const result = await this.queryBus.execute(
        new SearchUserQuery(
          {
            nickname: query.nickname,
            page: query.page,
            take: query.take,
          },
          this.contextService.getMessageMetadata(),
        ),
      );

      return result.match(
        ({ items, meta }: { items: UserEntity[]; meta: PaginationMeta }) =>
          apiOk(200, this.dtoMapper.toPaginatedPublicProfileDto(items, meta)),
        (error) => matchPublicError(error, {}),
      );
    });
  }
}
