module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "ignorePatterns": [
        "jest.config.ts",
        "lib",
        "node_modules",
        "tests/mock-packages/*",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    "plugins": [
        "eslint-plugin-jest",
        "@typescript-eslint"
    ],
    "root": true,
    "rules": {
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "generic"
            }
        ],
        "@typescript-eslint/ban-tslint-comment": "error",
        "@typescript-eslint/brace-style": "error",
        "@typescript-eslint/comma-spacing": "error",
        "@typescript-eslint/consistent-indexed-object-style": "error",
        "@typescript-eslint/consistent-type-assertions": [
            "error",
            {
                "assertionStyle": "as",
                "objectLiteralTypeAssertions": "allow-as-parameter"
            }
        ],
        "@typescript-eslint/default-param-last": "error",
        "@typescript-eslint/explicit-function-return-type": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "no-public"
            }
        ],
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi"
                }
            }
        ],
        "@typescript-eslint/no-confusing-non-null-assertion": "error",
        "@typescript-eslint/no-dupe-class-members": "error",
        "@typescript-eslint/no-duplicate-imports": "error",
        "@typescript-eslint/no-dynamic-delete": "error",
        "@typescript-eslint/no-empty-function": [
            "error",
            { "allow": ["protected-constructors", "private-constructors"] },
        ],
        "@typescript-eslint/no-extra-parens": "error",
        "@typescript-eslint/no-extraneous-class": [
            "error",
            {
                "allowStaticOnly": true
            }
        ],
        "@typescript-eslint/no-implicit-any-catch": "error",
        "@typescript-eslint/no-invalid-this": "error",
        "@typescript-eslint/no-invalid-void-type": "error",
        "@typescript-eslint/no-loop-func": "error",
        "@typescript-eslint/no-loss-of-precision": "error",
        "@typescript-eslint/no-redeclare": "error",
        "@typescript-eslint/no-require-imports": "error",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/prefer-enum-initializers": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-literal-enum-member": "error",
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/promise-function-async": "error",
        "@typescript-eslint/quotes": [
            "error",
            "double",
            { "allowTemplateLiterals": true }
        ],
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/unified-signatures": "error",
        "comma-dangle": [
            "error",
            {
                "arrays": "always-multiline",
                "functions": "always-multiline",
                "imports": "never",
                "objects": "always-multiline",
            }
        ],
        "jest/no-focused-tests": "error",
        "max-classes-per-file": "error",
        "no-await-in-loop": "error",
        "no-console": [
            "error",
            { "allow": ["info", "error"] }
        ],
        "no-empty-function": "off",
        "no-loss-of-precision": "error",
        "no-promise-executor-return": "error",
        "no-template-curly-in-string": "error",
        "no-unreachable-loop": "error",
        "no-useless-backreference": "error",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "quotes": "off",
        "require-atomic-updates": "error",
        "semi": "off",
        "strict": "error"
    }
};
