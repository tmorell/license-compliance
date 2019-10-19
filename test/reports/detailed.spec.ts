import test, { before } from "ava";
import * as sinon from "sinon";

import { Text } from "../../src/formatters/text";
import { Package } from "../../src/interfaces";
import { Detailed } from "../../src/reports/detailed";

before(() => {
    sinon.stub(process.stdout, "write");
});

test("Summary", (t) => {
    const packages: Array<Package> = [
        { name: "pack-mno", version: "1.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-abc", version: "2.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-xyz", version: "3.0.0", license: "MIT", repository: "company/project" },
    ];

    const report = new Detailed(new Text());
    report.process(packages);
    const sorted = report.packages;

    t.is(sorted[0].name, "pack-abc");
    t.is(sorted[1].name, "pack-mno");
    t.is(sorted[2].name, "pack-xyz");
});
