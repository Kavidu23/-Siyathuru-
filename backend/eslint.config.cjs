const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.env'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',

        // Jest globals
        describe: 'readonly',
        jest: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Express-friendly way for better performance
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: 'req|res|next',
        },
      ],

      // Prettier
      'prettier/prettier': 'error',
    },
  },
];
