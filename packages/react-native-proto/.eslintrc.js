module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    node: true,
    es2020: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    complexity: ['error', 25],
    'max-depth': ['error', 4],
    'max-lines-per-function': [
      'warn',
      { max: 140, skipBlankLines: true, skipComments: true },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'no-console': 'off',
  },
  ignorePatterns: [
    'lib/',
    'node_modules/',
    'bin/',
    'src/generated/messages.pb.js',
  ],
};
