export const stripUndefined = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj };

  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) {
      delete result[key];
    }
  });

  return result;
};
