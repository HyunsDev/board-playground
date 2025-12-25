import z from 'zod';

declare const __brand: unique symbol;

export type Brand<T, B> = T & { [__brand]: B };
export type Branded<T, B extends string> = Brand<T, B>;

export function brand<T, B extends string>(value: T): Branded<T, B> {
  return value as Branded<T, B>;
}
export function isBranded<T, B extends string>(value: unknown): value is Branded<T, B> {
  return typeof value === 'object' && value !== null && __brand in value;
}
export const brandedUuidSchema = <B extends Brand<string, string>>() => {
  return z.uuid().transform((val) => val as B);
};
export const brandedStringSchema = <B extends Brand<string, string>>() => {
  return z.string().transform((val) => val as B);
};
