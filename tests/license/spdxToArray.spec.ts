import test from "ava";

import { Literals } from "../../src/enumerations";
import { spdxToArray } from "../../src/license";

[
    // Valid
    { spdx: "MIT", licenses: ["MIT"] },
    { spdx: "Apache-2.0", licenses: ["Apache-2.0"] },
    { spdx: "(MIT)", licenses: ["MIT"] },
    { spdx: "(MIT OR ISC)", licenses: ["MIT", "ISC"] },
    // With extra spaces
    { spdx: " ISC", licenses: ["ISC"] },
    { spdx: "BSD ", licenses: ["BSD"] },
    { spdx: " (MIT  OR     Apache-2.0)  ", licenses: ["MIT", "Apache-2.0"] },
    // Invalid
    { spdx: "(MIT", licenses: [Literals.UNKNOWN] },
    { spdx: "MIT)", licenses: [Literals.UNKNOWN] },
].forEach((value): void => {
    test(`${value.spdx}`, (t): void => {
        const licenses = spdxToArray(value.spdx);
        t.is(licenses.length, value.licenses.length);
        licenses.forEach((license: string, index: number): void => {
            t.is(license, value.licenses[index]);
        });
    });
});
