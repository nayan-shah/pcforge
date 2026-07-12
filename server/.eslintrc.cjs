module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['import'],
  rules: {
    'import/no-unresolved': 'off'
  }
};
