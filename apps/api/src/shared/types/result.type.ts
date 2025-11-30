import { Result as NeverthrowResult } from 'neverthrow';

import { BaseError } from '../base/error/base.error';

export type Result<T, E extends BaseError = BaseError> = NeverthrowResult<T, E>;
