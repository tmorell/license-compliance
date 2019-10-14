import test, { before } from "ava";
import * as sinon from "sinon";

import { Text } from "../../src/formatters/text";
import { Package } from "../../src/interfaces";
import { Summary } from "../../src/reports/summary";

before(() => {
    sinon.stub(process.stdout, "write");
});

test("Summary", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", license: "MIT" },
        { name: "pack-02", license: "MIT" },
        { name: "pack-03", license: "ISC" },
        { name: "pack-04", license: "MIT" },
        { name: "pack-05", license: "ISC" },
        { name: "pack-06", license: "Apache-2.0" },
        { name: "pack-07", license: "MIT" },
        { name: "pack-08", license: "MIT" },
    ];

    const report = new Summary(new Text());
    report.process(packages);
    const licenses = report.summary;

    t.is(licenses[0].name, "MIT");
    t.is(licenses[0].count, 5);
    t.is(licenses[1].name, "ISC");
    t.is(licenses[1].count, 2);
    t.is(licenses[2].name, "Apache-2.0");
    t.is(licenses[2].count, 1);
});
