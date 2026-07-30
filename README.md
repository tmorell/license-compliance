[![GitHub Actions](https://github.com/tmorell/license-compliance/actions/workflows/ci.yaml/badge.svg)](https://github.com/tmorell/license-compliance/actions/workflows/ci.yaml)
[![Known Vulnerabilities](https://snyk.io/test/github/tmorell/license-compliance/badge.svg)](https://snyk.io/test/github/tmorell/license-compliance)
[![Socket Security](https://socket.dev/api/badge/npm/package/license-compliance)](https://socket.dev/npm/package/license-compliance)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=alert_status)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=coverage)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)

[![npm version](https://img.shields.io/npm/v/license-compliance)](https://www.npmjs.com/package/license-compliance)
[![npm downloads](https://img.shields.io/npm/dm/license-compliance)](https://www.npmjs.com/package/license-compliance)
[![Node.js](https://img.shields.io/node/v/license-compliance)](https://nodejs.org/)
[![Install Size](https://packagephobia.com/badge?p=license-compliance)](https://packagephobia.com/result?p=license-compliance)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/npm/l/license-compliance)](https://github.com/tmorell/license-compliance/blob/master/LICENSE)

# License Compliance

Analyzes installed package licenses to verify compliance with allowed license policies, generate detailed reports, and enforce compliance in CI/CD pipelines.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
    - [Basic Inspection](#basic-inspection)
    - [Compliance Verification](#compliance-verification)
    - [Querying Licenses](#querying-licenses)
    - [Filtering Dependencies](#filtering-dependencies)
    - [Excluding Packages](#excluding-packages)
    - [Output Formats](#output-formats)
- [Options Reference](#options-reference)
- [Exit Codes](#exit-codes)
- [Configuration](#configuration)
    - [Local Configuration File](#local-configuration-file)
    - [Shareable Configurations](#shareable-configurations)
    - [Configuration Precedence](#configuration-precedence)
    - [Debugging Configuration](#debugging-configuration)
- [CI/CD Integration](#cicd-integration)
- [License](#license)

---

## Features

- **Automated Policy Enforcement**: Verify installed package licenses against an allowed list of SPDX license identifiers.
- **Dependency Filtering**: Audit all dependencies, production-only (`-p`), development-only (`-d`), or direct dependencies (`-t`).
- **Flexible Exclusions**: Skip specific packages by exact name or regex pattern (`-e`).
- **Multiple Output Formats**: Output results as ASCII `text`, `csv`, `json`, or `xunit` (XML) test report format.
- **Shareable Configurations**: Share license compliance rules across projects using published npm packages.
- **CI/CD Ready**: Exits with code `0` on success/compliance and code `1` when non-compliant packages or configuration errors occur.

---

## Installation

Install `license-compliance` as a development dependency in your project:

```bash
npm install --save-dev license-compliance
```

Or run it directly using `npx`:

```bash
npx license-compliance
```

---

## Usage Examples

### Basic Inspection

Run `license-compliance` without arguments to get a summary of all installed package licenses (both production and development):

```bash
$ npx license-compliance

Licenses
├─ MIT: 366
├─ ISC: 46
├─ BSD-3-Clause: 11
├─ BSD-2-Clause: 9
├─ Apache-2.0: 6
├─ (MIT OR CC0-1.0): 3
├─ UNKNOWN: 3
└─ (BSD-2-Clause OR MIT OR Apache-2.0): 1
```

Get a detailed report showing package paths and repositories:

```bash
$ npx license-compliance --report detailed
```

---

### Compliance Verification

Verify compliance against a list of allowed licenses. When non-compliant packages are found, `license-compliance` outputs the non-compliant packages and exits with code `1`:

```bash
$ npx license-compliance --production --allow "MIT;ISC" --report detailed

Error: Not compliant packages found
Packages
├─ spdx-exceptions@2.2.0
│  ├─ Licenses: CC-BY-3.0
│  └─ Path: node_modules/spdx-exceptions
└─ spdx-license-ids@3.0.5
   ├─ Licenses: CC0-1.0
   └─ Path: node_modules/spdx-license-ids
```

If all installed packages comply with the allowed licenses, `license-compliance` exits with code `0` and generates no error output:

```bash
$ npx license-compliance --production --allow "MIT;ISC;CC-BY-3.0;CC0-1.0"
```

---

### Querying Licenses

Search for packages installed under specific licenses using `--query` (or `-q`):

```bash
$ npx license-compliance --production --report detailed --query "MIT"

Packages
├─ @babel/code-frame@7.18.6
│  ├─ Licenses: MIT
│  ├─ License file: node_modules/@babel/code-frame/LICENSE
│  ├─ Path: node_modules/@babel/code-frame
│  └─ Repository: https://github.com/babel/babel
└─ @babel/helper-validator-identifier@7.19.1
   ├─ Licenses: MIT
   ├─ License file: node_modules/@babel/helper-validator-identifier/LICENSE
   ├─ Path: node_modules/@babel/helper-validator-identifier
   └─ Repository: https://github.com/babel/babel
```

> **Note**: You can query `UNKNOWN` to inspect packages with unresolvable or missing license information: `--query "UNKNOWN"`.

---

### Filtering Dependencies

By default, all installed packages are analyzed. Use depth and scope flags to focus your audit:

- **Production dependencies only**:
    ```bash
    npx license-compliance --production
    ```
- **Development dependencies only**:
    ```bash
    npx license-compliance --development
    ```
- **Direct dependencies only** (depth = 1):
    ```bash
    npx license-compliance --direct
    ```

---

### Excluding Packages

Exclude packages from license analysis using exact package names or regular expression patterns separated by semicolons:

```bash
npx license-compliance --exclude "/^@the-project/;some-package"
```

In this example:

- Matches starting and ending with `/` are evaluated as regular expressions (e.g., `/^@the-project/` excludes all packages under `@the-project` scope).
- Plain strings match exact package names (e.g., `some-package`).

---

### Output Formats

Export reports in structured formats suitable for CI tools or automated data ingestion:

```bash
# Export as JSON
npx license-compliance --format json > report.json

# Export as CSV
npx license-compliance --format csv > report.csv

# Export as xUnit XML test results
npx license-compliance --format xunit > report.xml
```

---

## Options Reference

| Option                 | Alias | Type   | Default     | Description                                                                                     |
| :--------------------- | :---- | :----- | :---------- | :---------------------------------------------------------------------------------------------- |
| `--production`         | `-p`  | Flag   | `false`     | Analyzes only production dependencies. _Conflicts with `--development`._                        |
| `--development`        | `-d`  | Flag   | `false`     | Analyzes only development dependencies. _Conflicts with `--production`._                        |
| `--direct`             | `-t`  | Flag   | `false`     | Analyzes only direct dependencies (depth = 1).                                                  |
| `--format <format>`    | `-f`  | Enum   | `"text"`    | Report format: `csv`, `json`, `text`, or `xunit`.                                               |
| `--report <report>`    | `-r`  | Enum   | `"summary"` | Report type: `detailed` or `summary`.                                                           |
| `--allow <licenses>`   | `-a`  | String |             | Semicolon-separated list of allowed SPDX licenses. _Conflicts with `--query`._                  |
| `--query <licenses>`   | `-q`  | String |             | Semicolon-separated list of licenses to query (supports `UNKNOWN`). _Conflicts with `--allow`._ |
| `--exclude <packages>` | `-e`  | String |             | Semicolon-separated list of package names or regular expressions to exclude.                    |
| `--show-config`        | `-s`  | Flag   | `false`     | Displays the resolved configuration table breaking down options by source.                      |
| `--no-config`          | `-c`  | Flag   | `false`     | Ignores configuration files and relies strictly on command-line arguments.                      |
| `--version`            | `-v`  | Flag   |             | Displays the installed `license-compliance` version.                                            |
| `--help`               | `-h`  | Flag   |             | Displays command help information.                                                              |

> **SPDX Compliance**: License identifiers provided to `--allow` or `--query` must conform to standard [SPDX License List](https://spdx.org/licenses/) specifications (or `UNKNOWN`).

---

## Exit Codes

| Exit Code | Status      | Description                                                                                            |
| :-------: | :---------- | :----------------------------------------------------------------------------------------------------- |
|    `0`    | **Success** | All packages are compliant with allowed licenses, or license inspection completed successfully.        |
|    `1`    | **Failure** | One or more non-compliant packages were detected, or an invalid argument/configuration error occurred. |

---

## Configuration

In addition to command-line arguments, `license-compliance` supports configuration via local config files and reusable npm packages.

### Local Configuration File

Create a `.license-compliancerc.js`, `.license-compliancerc.json`, or add a `"license-compliance"` field in `package.json`:

```javascript
// .license-compliancerc.js
export default {
    allow: ["MIT", "ISC", "Apache-2.0"],
    exclude: [/^@acme/],
    format: "text",
    production: true,
    report: "summary",
};
```

---

### Shareable Configurations

Share compliance policies across repositories by publishing an npm package containing rule settings.

1. Publish an npm package (e.g., `@my-org/license-policy`) exporting your default configuration object:

    ```javascript
    // index.js in @my-org/license-policy
    export default {
        allow: ["MIT", "ISC", "Apache-2.0"],
        exclude: [/^@acme/],
        format: "text",
        production: true,
        report: "summary",
    };
    ```

2. Install your policy package in target projects:

    ```bash
    npm install --save-dev @my-org/license-policy
    ```

3. Reference the package in your local `.license-compliancerc.js`:

    ```javascript
    export default {
        extends: "@my-org/license-policy",
    };
    ```

> **Security Note**: `extends` must reference an installed package within `node_modules` to prevent directory traversal attacks.

---

### Configuration Precedence

When multiple configuration sources exist, options are merged according to the following priority:

`CLI arguments` > `local configuration file (.license-compliancerc.js)` > `extended shareable package`

- Any option passed via CLI flags overrides values set in local or extended configurations.
- Use `--no-config` (`-c`) to ignore local and extended configuration files completely.

---

### Debugging Configuration

Use `--show-config` (`-s`) to inspect the resolved configuration table and trace the origin of each setting:

```bash
npx license-compliance -s -a "Apache-2.0"
```

**Output**:

```
┌─────────────┬───────────────┬──────────────┬───────────────────────────┬────────────┐
│ (index)     │ configuration │ args         │ inline                    │ extended   │
├─────────────┼───────────────┼──────────────┼───────────────────────────┼────────────┤
│ allow       │ 'Apache-2.0'  │ 'Apache-2.0' │ 'MIT, 0BSD, BSD-3-Clause' │ 'MIT, ISC' │
│ config      │ true          │ true         │ '-'                       │ '-'        │
│ development │ false         │ '-'          │ false                     │ '-'        │
│ direct      │ true          │ '-'          │ true                      │ '-'        │
│ exclude     │ '/^@acme/'    │ '-'          │ '-'                       │ '/^@acme/' │
│ format      │ 'text'        │ '-'          │ 'text'                    │ 'json'     │
│ production  │ true          │ '-'          │ true                      │ '-'        │
│ query       │ '-'           │ '-'          │ '-'                       │ '-'        │
│ report      │ 'summary'     │ '-'          │ 'summary'                 │ '-'        │
│ showConfig  │ true          │ true         │ '-'                       │ '-'        │
└─────────────┴───────────────┴──────────────┴───────────────────────────┴────────────┘
```

---

## CI/CD Integration

Integrate `license-compliance` into your build pipelines to fail automated builds when unapproved licenses enter your dependency tree.

### `package.json` Script

```json
{
    "scripts": {
        "license-check": "license-compliance --production --allow=\"MIT;ISC;Apache-2.0\""
    }
}
```

### GitHub Actions Workflow Example

```yaml
name: License Compliance Audit

on:
    push:
        branches:
            - master
    pull_request:
        branches:
            - master

jobs:
audit-licenses:
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v7
          with:
              fetch-depth: 0
        - uses: actions/setup-node@v7
          with:
              node-version: 20
        - run: npm ci
        - name: Verify license compliance
          run: npm run license-check
```

---

## License

[MIT](LICENSE)
