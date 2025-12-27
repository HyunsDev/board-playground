import z from 'zod';

declare const __brand: unique symbol;

export type Brand<T = unknown, B extends string = string> = T & { readonly [__brand]: B };
export type Branded<T, B extends string> = Brand<T, B>;

export type BrandId<T extends string = string, B extends string = string> = Brand<T, B>;

export function brand<T, B extends string>(value: T): Branded<T, B> {
  return value as Branded<T, B>;
}
export const brandedUuidSchema = <B extends BrandId<string, string>>() => {
  return z.uuid().transform((val) => val as B);
};
export const brandedStringSchema = <B extends BrandId<string, string>>() => {
  return z.string().transform((val) => val as B);
};
