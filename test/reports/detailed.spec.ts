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
        { name: "pack-mno", license: "ISC" },
        { name: "pack-abc", license: "MIT" },
        { name: "pack-xyz", license: "MIT" },
    ];

    const report = new Detailed(new Text());
    report.process(packages);
    const sorted = report.packages;

    t.is(sorted[0].name, "pack-abc");
    t.is(sorted[1].name, "pack-mno");
    t.is(sorted[2].name, "pack-xyz");
});
