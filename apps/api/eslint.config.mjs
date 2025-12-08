import { nestJsConfig } from '@workspace/eslint-config/nest-js';
import functional from 'eslint-plugin-functional';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nestJsConfig,
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
    ignores: ['.prettierrc.mjs', 'eslint.config.mjs'],
  },
];
