import { Module } from '@nestjs/common';

import { ManagerFacade } from './application/manager.facade';
import { ManagerMapper } from './infra/manager.mapper';
import { ManagerDtoMapper } from './interface/manager.dto.mapper';
import { ManagerHttpController } from './interface/manager.http.controller';

@Module({
  imports: [],
  providers: [ManagerFacade, ManagerDtoMapper, ManagerMapper],
  controllers: [ManagerHttpController],
  exports: [ManagerFacade, ManagerDtoMapper, ManagerMapper],
})
export class ManagerFacadeModule {}
