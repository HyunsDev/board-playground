import { Injectable } from '@nestjs/common';

import { BoardRepositoryPort } from '../domain';

@Injectable()
export class BoardFacade {
  constructor(private readonly repo: BoardRepositoryPort) {}

  async getOneBySlug(slug: string) {
    return await this.repo.getOneBySlug(slug);
  }
}
