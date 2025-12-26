import { Prisma, PrismaClient } from '@workspace/database';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AbstractCrudDelegate<R> = {
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

export type PrismaModelName = Prisma.ModelName;
export type PrismaDelegateName = Uncapitalize<Prisma.ModelName>;

export type PrismaDelegateFromName<TClientName extends PrismaDelegateName> = PrismaClient extends {
  [K in TClientName]: infer M;
}
  ? M extends AbstractCrudDelegate<infer R>
    ? AbstractCrudDelegate<R>
    : never
  : never;

export type UserClientName = 'user';
export type UserDelegate1 = PrismaClient[UserClientName];
export type UserDelegate2 = PrismaDelegateFromName<UserClientName>;

export type UserDelegate11 = PrismaClient[PrismaDelegateName];
export type UserDelegate12 = PrismaDelegateFromName<PrismaDelegateName>;
