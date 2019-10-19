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
        { name: "pack-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-02", path: "pack-02", version: "2.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-03", path: "pack-03", version: "3.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-04", path: "pack-04", version: "4.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-05", path: "pack-05", version: "1.1.0", license: "ISC", repository: "company/project" },
        { name: "pack-06", path: "pack-06", version: "1.2.0", license: "Apache-2.0", repository: "company/project" },
        { name: "pack-07", path: "pack-07", version: "1.3.0", license: "MIT", repository: "company/project" },
        { name: "pack-08", path: "pack-08", version: "1.4.0", license: "MIT", repository: "company/project" },
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
