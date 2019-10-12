import test from "ava";

import { isLicenseValid } from "../../src/license";

["MIT", "ISC", "Apache-2.0"].forEach((value) => {
    test(`Valid license ${value}`, (t) => {
        t.true(isLicenseValid(value));
    });
});

["MIT/X11", "CCS-1", "Apache 2.0"].forEach((value) => {
    test(`Invalid license ${value}`, (t) => {
        t.false(isLicenseValid(value));
    });
});
