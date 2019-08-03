module.exports = {
  root: true,
  plugins: ['prettier', 'jsdoc'],
  extends: ['airbnb-base', 'prettier', 'plugin:jsdoc/recommended'],
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
    'jsdoc/no-undefined-types': 'warn',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
};
