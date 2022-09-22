module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "./.eslintrc.ext",
    ],
    ignorePatterns: [
        "**/*.js",
        "docs",
        "layers",
        "lib",
        "node_modules",
        "tests/mock-packages"
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    root: true,
};
