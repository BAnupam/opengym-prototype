module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    browser: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "import/no-cycle": "error",
  },
  overrides: [
    // packages/shared must not import from apps/*
    {
      files: "packages/shared/src/**",
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              {
                target: "./packages/shared/src",
                from: "./apps",
              },
            ],
          },
        ],
      },
    },
    // apps/web must not import from apps/api
    {
      files: "apps/web/src/**",
      rules: {
        "import/no-restricted-paths": [
          "error",
          {
            zones: [
              {
                target: "./apps/web/src",
                from: "./apps/api",
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ["dist/", "node_modules/", "coverage/", "openspec/"],
};
