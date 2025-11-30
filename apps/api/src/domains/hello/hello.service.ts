import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/infra/database/database.service';

@Injectable()
export class HelloService {
  constructor(private readonly prisma: DatabaseService) {}

  async createHello(content: string) {
    const res = await this.prisma.hello.create({
      data: {
        content,
      },
    });

    return res;
  }

  async findAllHello() {
    const res = await this.prisma.hello.findMany();
    return res;
  }

  async getHello(id: string) {
    const res = await this.prisma.hello.findUnique({
      where: {
        id,
      },
    });
    return res;
  }

  async updateHello(id: string, content: string) {
    const res = await this.prisma.hello.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });
    return res;
  }

  async deleteHello(id: string) {
    const res = await this.prisma.hello.delete({
      where: {
        id,
      },
    });
    return res;
  }
}
