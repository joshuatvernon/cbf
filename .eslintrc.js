module.exports = {
  root: true,
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'max-len': 'off',
    'prettier/prettier': 'error',
    'no-duplicate-imports': 'error',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
};
