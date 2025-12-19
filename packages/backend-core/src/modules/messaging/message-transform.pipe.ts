import { PipeTransform, Injectable } from '@nestjs/common';

import { AbstractMessage, MessageConstructor } from '@workspace/backend-ddd';

@Injectable()
export class MessageTransformPipe implements PipeTransform {
  constructor(private readonly messageClass: MessageConstructor<AbstractMessage>) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(value: any) {
    return this.messageClass.fromPlain(value);
  }
}
