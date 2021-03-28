![GitHub Actions](https://github.com/tmorell/license-compliance/actions/workflows/ci.yaml/badge.svg)
![David](https://img.shields.io/david/tmorell/license-compliance)
![Snyk Vulnerabilities for npm scoped package](https://img.shields.io/snyk/vulnerabilities/npm/license-compliance)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=alert_status)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tmorell_license-compliance&metric=coverage)](https://sonarcloud.io/dashboard?id=tmorell_license-compliance)

<div>

![npm](https://img.shields.io/npm/v/license-compliance)
![node](https://img.shields.io/node/v/license-compliance)
![NPM](https://img.shields.io/npm/l/license-compliance)

</div>


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
```
$ license-compliance --production --allow "MIT;ISC"

Packages
├─ spdx-exceptions@2.2.0
│  ├─ Licenses: CC-BY-3.0
│  └─ Path: node_modules/spdx-exceptions
└─ spdx-license-ids@3.0.5
   ├─ Licenses: CC0-1.0
   └─ Path: node_modules/spdx-license-ids
```
> Exits with 0 if all packages meet the allowed criteria; otherwise, exits with 1.

## Options
* `-p, --production` Analyzes only production dependencies.
* `-d, --development` Analyzes only development dependencies.
* `-t, --direct` Analyzes only direct dependencies (depth = 1).
* `-f, --format <format>` Report format, csv, text, json or xunit (default = "text").
* `-r, --report <report>` Report type, summary or detailed (default = "summary").
* `-a, --allow <licenses>` Semicolon separated list of allowed licenses. Must conform to [SPDX](https://spdx.org/licenses) specifications.
* `-e, --exclude <packages>` Semicolon separated list of package names to be excluded from the analysis. Regex expressions are supported.
* `-h, --help` Display help for command

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
