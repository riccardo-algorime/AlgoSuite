module.exports = {
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
      parserOptions: {
        project: null,
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    // Exclude config files from type-aware linting
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended', // Best-practice TS rules
    'plugin:prettier/recommended', // Prettier integration
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  // Use only the recommended rules for a balanced, modern setup
  rules: {
    // Warn instead of error for unused vars and any usage during migration
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
