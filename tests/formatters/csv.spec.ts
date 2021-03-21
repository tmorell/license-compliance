import test, { afterEach, beforeEach } from "ava";
import * as sinon from "sinon";

import { Csv } from "../../src/formatters/csv";
import { Package } from "../../src/interfaces";

let stub: sinon.SinonStub;

beforeEach(() => {
    stub = sinon.stub(console, "info");
});

afterEach(() => {
    sinon.restore();
});

test.serial("Detailed", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", path: "pack-01", version: "1.1.0", license: "MIT", repository: "company/project", licenseFile: "node_modules/pack-01/LICENSE" },
        { name: "pack-02", path: "pack-02", version: "2.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-03", path: "pack-03", version: "2.0.0", license: "(MIT OR Apache-2.0)", repository: "company/project" }
    ];

    const csv = new Csv();
    csv.detail(packages);

    t.true(stub.calledWithExactly(`"package name","version","license","license file","repository"`));
    t.true(stub.calledWithExactly(`"pack-01","1.1.0","MIT","node_modules/pack-01/LICENSE","company/project"`));
    t.true(stub.calledWithExactly(`"pack-02","2.0.0","ISC","UNKNOWN","company/project"`));
    t.true(stub.calledWithExactly(`"pack-03","2.0.0","(MIT OR Apache-2.0)","UNKNOWN","company/project"`));
});

test.serial("Invalid", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", path: "pack-01", version: "1.1.0", license: "MIT", repository: "company/project" },
        { name: "pack-02", path: "pack-02", version: "2.0.0", license: "ISC", repository: "company/project" },
        { name: "pack-03", path: "pack-03", version: "2.0.0", license: "(MIT OR Apache-2.0)", repository: "company/project" }
    ];

    const csv = new Csv();
    csv.invalid(packages);

    t.true(stub.calledWithExactly(`"package name","version","license","license file","repository"`));
    t.true(stub.calledWithExactly(`"pack-01","1.1.0","MIT","UNKNOWN","company/project"`));
    t.true(stub.calledWithExactly(`"pack-02","2.0.0","ISC","UNKNOWN","company/project"`));
    t.true(stub.calledWithExactly(`"pack-03","2.0.0","(MIT OR Apache-2.0)","UNKNOWN","company/project"`));
});

test.serial("Summary", (t) => {
    const licenses: Array<{ name: string; count: number }> = [
        { name: "MIT", count: 9 },
        { name: "Apache-2.0", count: 3 },
        { name: "ISC", count: 1 },
    ];

    const csv = new Csv();
    csv.summary(licenses);

    t.true(stub.calledWithExactly(`"license","count"`));
    t.true(stub.calledWithExactly(`"MIT","9"`));
    t.true(stub.calledWithExactly(`"Apache-2.0","3"`));
    t.true(stub.calledWithExactly(`"ISC","1"`));
});
