import { Module } from '@nestjs/common';
import { HelloService } from './hello.service';
import { HelloHttpController } from './hello.http.controller';

@Module({
  imports: [],
  controllers: [HelloHttpController],
  providers: [HelloService],
  exports: [],
})
export class HelloModule {}
