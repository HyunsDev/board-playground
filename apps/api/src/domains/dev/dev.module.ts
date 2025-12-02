import { Module } from '@nestjs/common';

import { DevController } from './dev.controller';

@Module({
  providers: [],
  controllers: [DevController],
})
export class DevModule {}
