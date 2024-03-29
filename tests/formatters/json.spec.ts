import test from "ava";
import * as sinon from "sinon";

import { Json } from "../../src/formatters/json";
import { Package } from "../../src/interfaces";

let stubConsole: sinon.SinonStub;
let spyJson: sinon.SinonSpy;

test.beforeEach((): void => {
    stubConsole = sinon.stub(console, "info");
    spyJson = sinon.spy(JSON, "stringify");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("Detailed", (t): void => {
    const packages: Array<Package> = [
        { name: "pack-01", path: "pack-01", version: "1.1.0", license: "MIT", repository: "company/project" },
    ];

    const json = new Json();
    json.detail(packages);

    t.true(spyJson.calledWithExactly(packages, null, 2));
    t.true(stubConsole.calledWithExactly(JSON.stringify(packages, null, 2)));
});

test.serial("Summary", (t): void => {
    const licenses: Array<{ name: string; count: number }> = [
        { name: "MIT", count: 9 },
        { name: "Apache-2.0", count: 3 },
    ];

    const json = new Json();
    json.summary(licenses);

    t.true(spyJson.calledWithExactly(licenses, null, 2));
    t.true(stubConsole.calledWithExactly(JSON.stringify(licenses, null, 2)));
});
