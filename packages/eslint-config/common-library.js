import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for Isomorphic libraries (Common logic).
 * used in both Backend (NestJS) and Frontend (Next.js/React).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const commonLibraryConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {},
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
