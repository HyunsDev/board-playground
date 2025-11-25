export interface SerializedException {
  message: string;
  code: string;
  stack?: string;
  cause?: unknown;
  metadata?: unknown;
}

/**
 * Base class for custom exceptions.
 * Framework independent (No NestJS/CLS dependency).
 */
export abstract class BaseException extends Error {
  abstract code: string;

  public readonly correlationId?: string;

  /**
   * @param {string} message
   * @param {Error | unknown} [cause] - The original error that caused this exception
   * @param {unknown} [metadata] - Additional debugging info
   */
  constructor(
    readonly message: string,
    readonly cause?: Error | unknown,
    readonly metadata?: unknown,
  ) {
    // Node.js standard: Pass options object with cause
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: TS definition might lag behind Node environment
    super(message, { cause });

    this.message = message;
    this.cause = cause;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * By default in NodeJS Error objects are not
   * serialized properly when sending plain objects
   * to external processes. This method is a workaround.
   *
   * @param includeStack - Whether to include stack trace (default: false for safety)
   */
  toJSON(includeStack = false): SerializedException {
    return {
      message: this.message,
      code: this.code,
      stack: includeStack ? this.stack : undefined,
      // cause가 Error 객체인 경우 직렬화가 안되므로 수동 처리
      cause: this.serializeCause(this.cause),
      metadata: this.metadata,
    };
  }

  private serializeCause(cause: unknown): unknown {
    if (cause instanceof Error) {
      return {
        name: cause.name,
        message: cause.message,
        stack: cause.stack,
      };
    }
    return cause;
  }
}
