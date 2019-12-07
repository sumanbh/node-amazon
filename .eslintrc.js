module.exports = {
  extends: "airbnb-base",
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: false
    },
    sourceType: "module"
  },
  rules: {
    "no-const-assign": "warn",
    "no-this-before-super": "warn",
    "no-undef": "warn",
    "no-unreachable": "warn",
    "no-unused-vars": "warn",
    "constructor-super": "warn",
    "valid-typeof": "warn",
    indent: ["error", 2, { SwitchCase: 1 }],
    "max-len": [
      "error",
      160,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    "no-continue": 0,
    "consistent-return": 0,
    "no-console": ["error", { allow: ["log", "warn", "error"] }],
    "prefer-arrow-callback": 0,
    "func-names": 0,
    "no-param-reassign": 0
  }
};
