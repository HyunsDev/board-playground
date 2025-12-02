import { Inject, Injectable } from '@nestjs/common';

import { CreateUserService } from '../application/services/create-user.service';
import { CreateUserProps } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { USER_REPOSITORY } from '../user.constant';

@Injectable()
export class UserFacade {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
    private readonly createUserService: CreateUserService,
  ) {}

  async createUser(props: CreateUserProps) {
    return await this.createUserService.create(props);
  }

  async findOneById(id: string) {
    return await this.userRepo.findOneById(id);
  }

  async getOneById(id: string) {
    return await this.userRepo.getById(id);
  }

  async findOneByEmail(email: string) {
    return await this.userRepo.findOneByEmail(email);
  }
}
