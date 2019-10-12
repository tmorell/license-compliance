![Travis (.com)](https://img.shields.io/travis/com/tmorell/license-compliance)
![David](https://img.shields.io/david/tmorell/license-compliance)
![Snyk Vulnerabilities for npm scoped package](https://img.shields.io/snyk/vulnerabilities/npm/license-compliance)
![NPM](https://img.shields.io/npm/l/license-compliance)
![npm](https://img.shields.io/npm/v/license-compliance)
![node](https://img.shields.io/node/v/license-compliance)

# License Compliance
Analyzes installed packages allowing to verify compliance with allowed licenses.

## Installation
```
npm install -D license-compliance
```

## Examples
Getting a summary of all installed packages (production and development).
```
license-compliance

Licenses
├─ MIT: 366
├─ ISC: 46
├─ BSD-3-Clause: 11
├─ BSD-2-Clause: 9
├─ Apache-2.0: 6
├─ (MIT OR CC0-1.0): 3
├─ UNKNOWN: 3
├─ CC0-1.0: 1
├─ (MIT AND CC-BY-3.0): 1
├─ CC-BY-3.0: 1d
├─ (WTFPL OR MIT): 1
└─ (BSD-2-Clause OR MIT OR Apache-2.0): 1

Total packages: 449
```

Verify compliance by providing list of allowed licenses
```
license-compliance --production --allow "MIT;ISC"

Error: The following packages do not meet the allowed license criteria
├─ spdx-exceptions@2.2.0
│  ├─ Licenses: CC-BY-3.0
│  └─ Path: node_modules/spdx-exceptions
└─ spdx-license-ids@3.0.5
   ├─ Licenses: CC0-1.0
   └─ Path: node_modules/spdx-license-ids

Note: Exits with status 1.
```

```
license-compliance --production --direct --allow "MIT;ISC"

Licenses
└─ MIT: 5

Total packages: 5

Note: Exits with status 0.
```

## Options
* ```-p, --production``` Analyzes only production dependencies.
* ```-d, --development``` Analyzes only development dependencies.
* ```-t, --direct``` Analyzes only direct dependencies.
* ```-f, --format <format>``` Report format, text or json. (default: "text")
* ```-r, --report <report>``` Report type, summary or detailed. (default: "summary")
* ```-a, --allow <licenses>``` Semicolon separated list of allowed licenses. Must conform to [SPDX specifications](https://spdx.org/licenses).
* ```-e, --exclude <packages>``` Semicolon separated list of package names to be excluded from the analysis. Regex are supported.
* ```-h, --help``` output usage information

## Excluding Packages
In some scenarios there might be the need to exclude certain packages from the analysis. Let's say there is no license information for some scoped packages (**@the-project**), but they are under an approved license for your project. Also, there is a very specific package under the same condition (**some-package**).

```--exclude "/^@the-project/;some-package"```

This will:
* Exclude all packages that match the regular expression **/^@the-project/**. Regular expressions must start and end with "/".
* Exclude a package named **some-package**.

## As Part of Your CI
package.json
```
"scripts": {
    :
    "license-compliance": "license-compliance --production --allow=\"MIT;ISC\""
    :
}
```
Add it the CI configuration
```
    script: / run: / etc
    npm run license-compliance
```
