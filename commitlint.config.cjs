module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [0],
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'api-e2e',
        'web',
        'be-common',
        'be-core',
        'ddd',
        'be-infra',
        'common',
        'contract',
        'database',
        'domain',
        'eslint',
        'jest',
        'typescript',
        'infra',
      ],
    ],
    'subject-case': [0],
  },
};
