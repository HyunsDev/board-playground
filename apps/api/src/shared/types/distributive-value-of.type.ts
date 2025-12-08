export type DistributiveValueOf<T> = {
  [K in keyof T]: T[K][keyof T[K]];
}[keyof T];
