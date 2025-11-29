import { Module } from '@nestjs/common';

import { HelloHttpController } from './hello.http.controller';
import { HelloService } from './hello.service';

@Module({
  imports: [],
  controllers: [HelloHttpController],
  providers: [HelloService],
  exports: [],
})
export class HelloModule {}
