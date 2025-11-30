import { Controller, Get } from '@nestjs/common';

@Controller('dev')
export class DevController {
  constructor() {}

  @Get()
  async getDevInfo() {
    return {
      status: 'ok',
      message: 'Development API is running',
    };
  }

  @Get('test')
  async getDevTest() {
    return {
      status: 'ok',
      message: 'Development API is running',
    };
  }
}
