import { Module } from '@nestjs/common';

import { AppointSubManagerCommandHandler } from './application/commands/appoint-sub-manager.command';
import { DismissSubManagerCommandHandler } from './application/commands/dismiss-sub-manager.command';
import { TransferMainManagerCommandHandler } from './application/commands/transfer-main-manager.command';
import { ListBoardManagersQueryHandler } from './application/queries/list-board-managers.query';
import { ListUserManagersQueryHandler } from './application/queries/list-user-managers.query';
import { ManagerRepositoryPort } from './domain';
import { ManagerMapper } from './infra/manager.mapper';
import { ManagerRepository } from './infra/manager.repository';
import { UserFacadeModule } from '../user/user.facade.module';
import { ManagerDtoMapper } from './interface/manager.dto.mapper';
import { ManagerHttpController } from './interface/manager.http.controller';
import { BoardFacadeModule } from '../board/board.facade.module';

const CommandHandlers = [
  AppointSubManagerCommandHandler,
  DismissSubManagerCommandHandler,
  TransferMainManagerCommandHandler,
];

const queryHandlers = [ListBoardManagersQueryHandler, ListUserManagersQueryHandler];

const mappers = [ManagerMapper, ManagerDtoMapper];

const repositories = [
  {
    provide: ManagerRepositoryPort,
    useClass: ManagerRepository,
  },
];

@Module({
  imports: [BoardFacadeModule, UserFacadeModule],
  providers: [...CommandHandlers, ...queryHandlers, ...mappers, ...repositories],
  controllers: [ManagerHttpController],
  exports: [],
})
export class ManagerModule {}
