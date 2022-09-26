import test from "ava";

import { isLicenseValid } from "../../src/license";

["MIT", "ISC", "Apache-2.0"].forEach((value): void => {
    test(`Valid license ${value}`, (t): void => {
        t.true(isLicenseValid(value));
    });
});

["MIT/X11", "CCS-1", "Apache 2.0"].forEach((value): void => {
    test(`Invalid license ${value}`, (t): void => {
        t.false(isLicenseValid(value));
    });
});
