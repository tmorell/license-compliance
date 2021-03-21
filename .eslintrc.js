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
        // "@proving-grounds/eslint-config-rules"
    ],
    "ignorePatterns": [
        "jest.config.ts",
        "lib",
        "node_modules",
        "tests/mock-packages/*",
    ],
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "eslint-plugin-jest",
        "@typescript-eslint"
    ],
    "root": true
};
