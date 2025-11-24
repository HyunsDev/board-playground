import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    passwordSalt: string;
    username: string;
    nickname: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        passwordSalt: data.passwordSalt,
        username: data.username,
        nickname: data.nickname,
      },
    });
  }
}
