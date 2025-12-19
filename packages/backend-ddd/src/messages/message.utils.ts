import { AbstractMessage } from './abstract.message';
import { RESULT_TYPE_SYMBOL } from './message.constant';

export type MessageResult<C extends AbstractMessage> = C[typeof RESULT_TYPE_SYMBOL];
