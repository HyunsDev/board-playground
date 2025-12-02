import { faker } from '@faker-js/faker';

export type MockUser = {
  email: string;
  password: string;
  username: string;
  nickname: string;
};

export const createMockUser = (): MockUser => {
  return {
    email: faker.internet.email(),
    password: 'password123',
    username: faker.internet.username(),
    nickname: faker.person.firstName(),
  };
};
