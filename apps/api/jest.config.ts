import type { Config } from 'jest';
import { nestConfig } from '@workspace/jest-config/nest';

const config: Config = {
  ...nestConfig,
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/devtools'],
  coverageDirectory: '<rootDir>/coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^chalk$': '<rootDir>/devtools/test-contracts/__mocks__/chalk.js',
    '^uuid$': '<rootDir>/devtools/test-contracts/__mocks__/uuid.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        useESM: true,
      },
    ],
  },
};

export default config;
