import { Injectable, PipeTransform, mixin, Type } from '@nestjs/common';

import {
  AbstractMessage,
  InvalidMessageException,
  MessageConstructor,
} from '@workspace/backend-ddd';

export const MessageTransformPipe = (
  messageClass: MessageConstructor<AbstractMessage>,
): Type<PipeTransform> => {
  @Injectable()
  class MixinMessageTransformPipe implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform(value: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const message = messageClass.fromPlain(value);

      if (!message.metadata?.correlationId) {
        throw new InvalidMessageException('Missing correlationId in message metadata');
      }

      return message;
    }
  }

  return mixin(MixinMessageTransformPipe);
};
