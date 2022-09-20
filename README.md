[![GitHub Actions](https://github.com/tmorell/license-compliance/actions/workflows/ci.yaml/badge.svg)](https://github.com/tmorell/license-compliance/actions/workflows/ci.yaml)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/license-compliance)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=alert_status)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=coverage)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)


![npm version](https://img.shields.io/npm/v/license-compliance)
![Node.js](https://img.shields.io/node/v/license-compliance)
[![License](https://img.shields.io/npm/l/license-compliance)](https://github.com/tmorell/license-compliance/blob/master/LICENSE)

# License Compliance
Analyzes installed packages allowing to verify compliance with allowed licenses.

## Installation
```bash
npm install --save-dev license-compliance
```

## Examples
Getting a summary of all installed packages (production and development).
```
$ license-compliance

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

Verify compliance by providing list of allowed licenses.
```bash
$ license-compliance --production --allow "MIT;ISC"

Packages
├─ spdx-exceptions@2.2.0
│  ├─ Licenses: CC-BY-3.0
│  └─ Path: node_modules/spdx-exceptions
└─ spdx-license-ids@3.0.5
   ├─ Licenses: CC0-1.0
   └─ Path: node_modules/spdx-license-ids
```
> If there are non compliant packages, it exits with code 1, and outputs the non compliant packages.

```bash
$ license-compliance --production --allow "MIT;ISC;CC-BY-3.0;CC0-1.0"
```
> If all packages are compliant, it exits with code 0 and no additional output.

Find which packages have a specific license.
```bash
$ license-compliance --production --report detailed --query "MIT"

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

## Options
* `-p, --production` Analyzes only production dependencies.
* `-d, --development` Analyzes only development dependencies.
* `-t, --direct` Analyzes only direct dependencies (depth = 1).
* `-f, --format <format>` Report format, csv, text, json, or xunit (default = "text").
* `-r, --report <report>` Report type, summary or detailed (default = "summary").
* `-a, --allow <licenses>` Semicolon separated list of allowed licenses.
* `-e, --exclude <packages>` Semicolon separated list of package names to be excluded from the analysis. Regex expressions are supported.
* `-q, --query <licenses>` Semicolon separated list of licenses.
* `-h, --help` Display help for command

> `<licenses>` must conform to [SPDX](https://spdx.org/licenses) specifications.

## Excluding Packages
In some scenarios there might be the need to exclude certain packages from the analysis. Let's say there is no license information for some scoped packages (**@the-project**), but they are under an approved license for your project. Also, there is a very specific package under the same condition (**some-package**).

```--exclude "/^@the-project/;some-package"```

This will:
* Exclude all packages that match the regular expression **/^@the-project/**. Regular expressions must start and end with "/".
* Exclude a package named **some-package**.

## As Part of Your CI
package.json
```json
{
    "scripts": {
        "license-compliance": "license-compliance --production --allow=\"MIT;ISC\""
    }
}
```
Add it to the CI pipeline.
```
script: / run: / etc
npm run license-compliance
```

# Sharable Configurations
Sharable configurations allow you to publish your compliance rules and share them across multiple projects. A sharable configuration is an npm package that exports a module.
1. Create an npm package with an index.js file and export an object containing your settings. For example:
```javascript
module.exports = {
    allow: ['MIT', "ISC"],
    exclude: [/^@acme/],
    format: "text",
    production: true,
    report: "summary",
};
```
2. Install the npm package in your solution(s).
2. Add a configuration file `.license-compliancerc.js` to the root of your project.
```javascript
module.exports = {
    extends: "{name of your package with the configuration rules}",
};

```
> The configuration file `.license-compliancerc.js` can also include other properties besides `extends`, allowing you to override the settings from the installed shared package. The command line in the CI will override any configuration; `CLI` > `Inline` > `Shared configuration package`.

# License
MIT
