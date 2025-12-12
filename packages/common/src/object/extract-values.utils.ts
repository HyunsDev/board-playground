export type ExtractEnumValues<T> =
  T extends Record<string, infer V> ? (V extends string ? V : ExtractEnumValues<V>) : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractEnumValues<T extends Record<string, any>>(obj: T) {
  const result: string[] = [];

  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      result.push(value);
    } else if (typeof value === 'object') {
      result.push(...extractEnumValues(value));
    }
  }

  return result as ExtractEnumValues<T>[];
}
