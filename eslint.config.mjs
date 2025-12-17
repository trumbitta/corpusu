import js from '@eslint/js';
import eslintPluginTypescript from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', '.nx', 'out-tsc'],
  },
  js.configs.recommended,
  ...eslintPluginTypescript.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintPluginPrettier,
];
