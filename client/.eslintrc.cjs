module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'airbnb',
    "airbnb/hooks",
    'plugin:react/jsx-runtime',
    'plugin:import/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: {
    react: { version: '18.2' },
    "import/resolver": {
      "node": {
        "moduleDirectory": [
          "node_modules",
          "."
        ]
      }
    },
  },
  plugins: ['react-refresh', 'import'],
  rules: {
    "no-plusplus": "off",
    "no-nested-ternary": "off",
    "max-len": ["warn", {"code": 130, "ignoreComments": true}],
    "no-underscore-dangle": "off",
    "no-unused-vars": [
      "warn",
      {
        "varsIgnorePattern": "^_" ,
        "caughtErrors": "none",
        "args": "none"
      }
    ],
    "import/no-unresolved": ["error", { "ignore": ["[?]react$", "swiper"]}],
    "import/prefer-default-export": "off",
    "react-refresh/only-export-components": ['warn', { allowConstantExport: true }],
    "react/jsx-props-no-spreading": "off",
    "react/forbid-prop-types": "off",
    "react/require-default-props": "off",
  },
}
