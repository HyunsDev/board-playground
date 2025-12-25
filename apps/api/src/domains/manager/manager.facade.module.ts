import { Module } from '@nestjs/common';

import { ManagerFacade } from './application/manager.facade';
import { ManagerRepositoryPort } from './domain';
import { ManagerMapper } from './infra/manager.mapper';
import { ManagerRepository } from './infra/manager.repository';
import { UserFacadeModule } from '../user/user.facade.module';
import { ManagerDtoMapper } from './interface/manager.dto.mapper';
import { BoardFacadeModule } from '../board/board.facade.module';

const mappers = [ManagerMapper, ManagerDtoMapper];

const repositories = [
  {
    provide: ManagerRepositoryPort,
    useClass: ManagerRepository,
  },
];

@Module({
  imports: [UserFacadeModule, BoardFacadeModule],
  providers: [ManagerFacade, ...mappers, ...repositories],
  controllers: [],
  exports: [ManagerFacade, ...mappers],
})
export class ManagerFacadeModule {}
