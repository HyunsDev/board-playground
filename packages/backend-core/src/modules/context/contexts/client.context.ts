import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { AppStore } from '../context.types';

@Injectable()
export class ClientContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  get client() {
    return this.cls.get('client');
  }

  setClient(client: { ipAddress: string; userAgent: string }) {
    this.cls.set('client', client);
  }
}
