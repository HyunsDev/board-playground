import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { AppStore } from '../context.types';

@Injectable()
export class CoreContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get requestId() {
    return this.cls.get('requestId');
  }

  setRequestId(id: string) {
    this.cls.set('requestId', id);
  }

  get errorCode() {
    return this.cls.get('errorCode');
  }

  setErrorCode(code: string) {
    this.cls.set('errorCode', code);
  }

  run<T>(fn: () => T): T {
    return this.cls.run(fn);
  }
}
