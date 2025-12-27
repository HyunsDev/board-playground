/* eslint-disable @typescript-eslint/no-explicit-any */
export type AbstractCrudDelegate<R> = {
  findFirst(args: any): Promise<R | null>;
  findUnique(args: any): Promise<R | null>;
  findMany(args: any): Promise<R[]>;
  create(args: any): Promise<R>;
  createMany(args: any): Promise<{
    count: number;
  }>;
  update(args: any): Promise<R>;
  updateMany(args: any): Promise<{ count: number }>;
  delete(args: any): Promise<R>;
  deleteMany(args: any): Promise<{ count: number }>;
  count(args: any): Promise<number>;
};
