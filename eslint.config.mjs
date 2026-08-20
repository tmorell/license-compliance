import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import avaPlugin from "eslint-plugin-ava";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["**/docs", "**/layers", "**/lib", "**/node_modules", "tests/mock-packages"],
    },
    ...compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "./.eslintrc.ext.json",
    ),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            "@stylistic": stylistic,
            ava: avaPlugin,
        },
        languageOptions: {
            parser: tsParser,
        },
    },
    {
        files: ["**/*.mjs", "**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-member-accessibility": "off",
            "@typescript-eslint/consistent-type-assertions": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
