import { Injectable } from '@nestjs/common';

import { CreateUserProps, UserEntity } from '../../domain/user.entity';
import { UserRepositoryPort } from '../../domain/user.repository.port';

@Injectable()
export class UserFacade {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async create(props: CreateUserProps) {
    const user = UserEntity.create(props);
    const created = await this.userRepo.create(user);
    return created;
  }

  async findOneById(id: string) {
    return await this.userRepo.findOneById(id);
  }

  async getOneById(id: string) {
    return await this.userRepo.getOneById(id);
  }

  async getOneByEmail(email: string) {
    return await this.userRepo.getOneByEmail(email);
  }

  async usernameExists(username: string) {
    return await this.userRepo.usernameExists(username);
  }
}
