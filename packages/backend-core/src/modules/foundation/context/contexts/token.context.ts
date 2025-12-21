import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { TokenPayload } from '@workspace/domain';

import { AppStore } from '../context.types';

@Injectable()
export class TokenContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get token() {
    return this.cls.get('token');
  }

  get userId() {
    return this.token?.sub;
  }

  setToken(token: TokenPayload) {
    this.cls.set('token', token);
  }
}
