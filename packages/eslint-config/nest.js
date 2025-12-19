import globals from 'globals';
import { config as baseConfig } from './base.js';
import functional from 'eslint-plugin-functional';
import localRulesPlugin from './eslint-local-rules/index.js';

/**
 * A custom ESLint configuration for Nest.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nestJsConfig = [
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
    plugins: {
      functional,
    },
    rules: {
      'functional/no-expression-statements': [
        'error',
        {
          ignoreVoid: true,
          ignoreCodePattern: ['^this\\..+ = [\\s\\S]+$', '^void [\\s\\S]+$'],
        },
      ],
    },
  },
  {
    plugins: {
      'local-rules': localRulesPlugin,
    },
    rules: {
      'local-rules/force-static-code': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
];
