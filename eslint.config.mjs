import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import tailwindcss from "eslint-plugin-tailwindcss";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import reactCompiler from "eslint-plugin-react-compiler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "plugin:prettier/recommended"),
  {
    settings: {
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cva", "tv", "cn"],
      },
    },

    rules: {
      "prettier/prettier": ["warn"],
    },
  },
  ...compat
    .extends(
      "plugin:tailwindcss/recommended",
      "next/core-web-vitals",
      "plugin:prettier/recommended",
    )
    .map((config) => ({
      ...config,
      files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    })),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],

    plugins: {
      "@typescript-eslint": typescriptEslint,
      "unused-imports": unusedImports,
      tailwindcss,
      "simple-import-sort": simpleImportSort,
      "react-compiler": reactCompiler,
    },

    rules: {
      "react-compiler/react-compiler": "warn",
      "prettier/prettier": ["warn"],
      "tailwindcss/no-custom-classname": ["off"],
      "import/no-extraneous-dependencies": "warn",
      "no-param-reassign": "off",
      "consistent-return": "off",
      "no-empty-pattern": "off",
      "no-use-before-define": "off",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "react/jsx-no-constructed-context-values": "off",
      "import/extensions": "off",
      "react/function-component-definition": "off",
      "react/destructuring-assignment": "off",
      "react/require-default-props": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-unstable-nested-components": "off",
      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-restricted-syntax": [
        "error",
        "ForInStatement",
        "LabeledStatement",
        "WithStatement",
      ],
      "import/prefer-default-export": "off",
      "simple-import-sort/imports": "error",
      "import/order": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/naming-convention": "off",
      "import/no-anonymous-default-export": "off",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
