import test, { afterEach, beforeEach } from "ava";
import * as sinon from "sinon";

import { Text } from "../../src/formatters/text";
import { Package } from "../../src/interfaces";
import { UNKNOWN } from "../../src/license";

let stubLog: sinon.SinonStub;

beforeEach(() => {
    stubLog = sinon.stub(console, "log");
});

afterEach(() => {
    sinon.restore();
});

test.serial("Detail", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", version: "1.1.0", license: "MIT" },
        { name: "pack-02", version: "2.0.0", license: "ISC" },
        { name: "pack-03", version: "2.0.0", license: "(MIT OR Apache-2.0)" }
    ];

    const csv = new Text();
    csv.detail(packages);

    t.is(stubLog.callCount, 5);
});

test.serial("Invalid, single package", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", version: "1.1.0", license: "MIT" }
    ];

    const csv = new Text();
    csv.invalid(packages);

    t.is(stubLog.callCount, 2);
});

test.serial("Invalid, multiple packages", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", version: "1.1.0", license: "MIT" },
        { name: "pack-02", version: "2.0.0", license: "ISC" },
        { name: "pack-03", version: "2.0.0", license: "(MIT OR Apache-2.0)" }
    ];

    const csv = new Text();
    csv.invalid(packages);

    t.is(stubLog.callCount, 4);
});

test.serial("Summary", (t) => {
    const licenses: Array<{ name: string, count: number }> = [
        { name: "MIT", count: 15 },
        { name: UNKNOWN, count: 5 },
        { name: "ISC", count: 1 }
    ];

    const csv = new Text();
    csv.summary(licenses);

    t.is(stubLog.callCount, 5);
});
