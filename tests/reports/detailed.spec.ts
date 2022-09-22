import test from "ava";
import * as sinon from "sinon";

import { Text } from "../../src/formatters/text";
import { Package } from "../../src/interfaces";
import { Detailed } from "../../src/reports/detailed";

test.beforeEach((): void => {
    sinon.stub(process.stdout, "write");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("Summary", (t): void => {
    const packages: Array<Package> = [
        { name: "pack-mno", path: "pack-mno", version: "1.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-abc", path: "pack-abc", version: "2.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-xyz", path: "pack-xyz", version: "3.0.0", license: "MIT", repository: "company/project" },
    ];

    const report = new Detailed(new Text());
    report.process(packages);
    const sorted = report.packages;

    t.is(sorted[0].name, "pack-abc");
    t.is(sorted[1].name, "pack-mno");
    t.is(sorted[2].name, "pack-xyz");
});

test.serial("With errors", (t): void => {
    const packages: Array<Package> = [
        { name: "pack-mno", path: "pack-mno", version: "1.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-abc", path: "pack-abc", version: "2.0.0", license: "MIT", repository: "company/project" },
        { name: "pack-xyz", path: "pack-xyz", version: "3.0.0", license: "MIT", repository: "company/project" },
    ];

    const report = new Detailed(new Text());
    report.process(packages);
    const sorted = report.packages;

    t.is(sorted[0].name, "pack-abc");
    t.is(sorted[1].name, "pack-mno");
    t.is(sorted[2].name, "pack-xyz");
});
