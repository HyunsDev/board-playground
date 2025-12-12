import globals from 'globals';
import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for NestJS specific libraries.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestLibraryConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { accessibility: 'no-public' }, // public은 생략, private/protected는 명시
      ],
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
