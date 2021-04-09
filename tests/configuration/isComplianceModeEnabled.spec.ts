import test from "ava";

import { isComplianceModeEnabled } from "../../src/configuration";

test.serial("Running compliance checkup when allow is set", async (t) => {
    const complianceMode = isComplianceModeEnabled({
        allow: ["MIT"],
    });

    t.true(complianceMode);
});

test.serial("Running license inspection otherwise", (t) => {
    const complianceMode = isComplianceModeEnabled({
        allow: [],
    });

    t.false(complianceMode);
});
