/* eslint-disable @typescript-eslint/no-explicit-any */
export type AbstractCrudDelegate<R> = {
  findUnique(args: any): Promise<R | null>;
  findMany(args: any): Promise<R[]>;
  create(args: any): Promise<R>;
  createMany(args: any): Promise<{
    count: number;
  }>;
  update(args: any): Promise<R>;
  delete(args: any): Promise<R>;
  deleteMany(args: any): Promise<{ count: number }>;
  count(args: any): Promise<number>;
};
