module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'tailwindcss'],
  rules: {
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
