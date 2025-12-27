import { Injectable } from '@nestjs/common';

import { BoardSlug } from '@workspace/domain';

import { BoardRepositoryPort } from '../domain';

@Injectable()
export class BoardFacade {
  constructor(private readonly repo: BoardRepositoryPort) {}

  async getOneBySlug(slug: BoardSlug) {
    return await this.repo.getOneBySlug(slug);
  }
}
