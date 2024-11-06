module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
    'plugin:import/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'src/react-email/dist/**/*',
    'client-build/**/*',
    '.adminjs/**/*',
    'src/config.js',
  ],
  settings: {
    react: {
      version: '18.2',
    },
    'import/resolver': {
      node: {
        moduleDirectory: [
          'node_modules',
          '.',
        ],
      },
    },
  },
  plugins: [
    'react-refresh',
    'import',
  ],
  rules: {
    'max-len': [
      'warn',
      {
        code: 130,
        ignoreComments: true,
      },
    ],
    'prefer-destructuring': ['warn', { array: false }],
    'no-unused-vars': [
      'warn',
      {
        caughtErrors: 'none',
        args: 'none',
      },
    ],
    'class-methods-use-this': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'max-classes-per-file': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'import/extensions': 'off',
    'react/forbid-prop-types': 'off',
    'react/require-default-props': 'off',
  },
};
