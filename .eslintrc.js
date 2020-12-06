module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: false,
    },
    sourceType: 'module',
  },
  overrides: [
    {
      files: [
        '*.js',
      ],
      extends: [
        'airbnb-base',
      ],
      rules: {
        'no-const-assign': 'warn',
        'no-this-before-super': 'warn',
        'no-undef': 'warn',
        'no-unreachable': 'warn',
        'no-unused-vars': 'warn',
        'constructor-super': 'warn',
        'valid-typeof': 'warn',
        indent: ['error', 2, { SwitchCase: 1 }],
        'max-len': [
          'error',
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
        'no-continue': 0,
        'consistent-return': 0,
        'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
        'prefer-arrow-callback': 0,
        'func-names': 0,
        'no-param-reassign': 0,
      },
    },
    {
      files: [
        '*.ts',
      ],
      parserOptions: {
        project: [
          'tsconfig.json',
          // 'e2e/tsconfig.json',
        ],
        createDefaultProgram: true,
      },
      extends: [
        'plugin:@angular-eslint/ng-cli-compat',
        'plugin:@angular-eslint/ng-cli-compat--formatting-add-on',
        'plugin:@angular-eslint/template/process-inline-templates',
      ],
      rules: {
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
          'off',
          {
            accessibility: 'explicit',
          },
        ],
        'brace-style': [
          'error',
          '1tbs',
        ],
        curly: 'off',
        'id-blacklist': 'off',
        'id-match': 'off',
        'no-redeclare': 'error',
        'no-shadow': [
          'off',
          {
            hoist: 'all',
          },
        ],
        'no-underscore-dangle': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'prefer-arrow/prefer-arrow-functions': 'off',
      },
    },
    {
      files: [
        '*.html',
      ],
      extends: [
        'plugin:@angular-eslint/template/recommended',
      ],
      rules: {},
    },
  ],
};
