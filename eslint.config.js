const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");
const angular = require("angular-eslint");
const tseslint = require("typescript-eslint");

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
      },

      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: false,
        },
      },
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      "no-const-assign": "warn",
      "no-this-before-super": "warn",
      "no-undef": "warn",
      "no-unreachable": "warn",
      "no-unused-vars": "warn",
      "constructor-super": "warn",
      "valid-typeof": "warn",

      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],

      "max-len": [
        "error",
        160,
        2,
        {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],

      "no-continue": 0,
      "consistent-return": 0,

      "no-console": [
        "error",
        {
          allow: ["log", "warn", "error"],
        },
      ],

      "func-names": 0,
      "no-param-reassign": 0,
    },
  },
  {
    files: ["**/*.ts"],

    extends: [
      // Apply the recommended core rules
      js.configs.recommended,
      // Apply the recommended TypeScript rules
      ...tseslint.configs.recommended,
      // Optionally apply stylistic rules from typescript-eslint that improve code consistency
      ...tseslint.configs.stylistic,
      // Apply the recommended Angular rules
      ...angular.configs.tsRecommended,
    ],

    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true,
      },
    },

    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],

      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],

      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/dot-notation": "off",

      "@typescript-eslint/explicit-member-accessibility": [
        "off",
        {
          accessibility: "explicit",
        },
      ],

      "brace-style": ["error", "1tbs"],
      curly: "off",
      "id-blacklist": "off",
      "id-match": "off",
      "no-redeclare": "error",

      "no-shadow": [
        "off",
        {
          hoist: "all",
        },
      ],

      "no-underscore-dangle": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      // Apply the recommended Angular template rules
      ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  globalIgnores([
    ".yarn",
    ".angular",
    "dist",
    "build",
    "config",
    "server/pg-format/index.js",
  ]),
]);
