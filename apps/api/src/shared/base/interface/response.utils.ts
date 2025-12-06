import { ApiError } from '@workspace/contract';

export const apiOk = <const S extends number, const B>(status: S, body: B) => {
  return { status, body } as const;
};

export const apiErr = <const B extends ApiError, const Details>(
  exceptionBody: B,
  details?: Details,
) => {
  return {
    status: exceptionBody.status as B['status'],
    body: {
      ...exceptionBody,
      details,
    },
  } as const;
};
