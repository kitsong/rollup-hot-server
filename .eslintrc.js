module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-shadow': 'off',
    'prettier/prettier': 'error',
    strict: 'off',
    'no-console': 'warn',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'require-yield': 'off',
    'no-nested-ternary': 'off',
    'class-methods-use-this': 'off',
    'new-cap': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
}
