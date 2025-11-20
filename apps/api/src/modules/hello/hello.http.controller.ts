import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('hellos')
export class HelloHttpController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  async listHellos() {
    return this.helloService.findAllHello();
  }

  @Get(':helloId')
  async getHello(@Param('helloId') helloId: string) {
    return this.helloService.getHello(helloId);
  }

  @Post()
  async createHello(@Body() body: { content: string }) {
    return this.helloService.createHello(body.content);
  }

  @Put(':helloId')
  async updateHello(@Param('helloId') helloId: string, @Body() body: { content: string }) {
    return this.helloService.updateHello(helloId, body.content);
  }

  @Delete(':helloId')
  async deleteHello(@Param('helloId') helloId: string) {
    return this.helloService.deleteHello(helloId);
  }
}
