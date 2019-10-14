import test, { after, before } from "ava";
import * as path from "path";
import * as sinon from "sinon";

import { getInstalledPackages } from "../../src/npm";

before(() => {
    sinon.stub(console, "log");
    sinon.stub(console, "error");
});

after(() => {
    sinon.restore();
});

test("Get packages, empty package.json", async (t) => {
    // Arguments
    sinon.stub(require("../../src/program"), "args").value({ production: undefined, development: undefined });

    const packages = await getInstalledPackages(path.join(__dirname, "..", "mock-packages", "installation-empty"));

    t.is(packages.length, 0);
});

test.serial("Get all packages, full installation", async (t) => {
    // Arguments
    sinon.stub(require("../../src/program"), "args").value({ production: undefined, development: undefined });

    const packages = await getInstalledPackages(path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 7);
    t.is(packages[0].name, "prod-01");
    t.is(packages[0].version, "1.0.0");
    t.is(packages[1].name, "prod-02");
    t.is(packages[1].version, "2.0.0");
    t.is(packages[2].name, "prod-02-02");
    t.is(packages[2].version, "2.0.0");
    t.is(packages[3].name, "prod-03");
    t.is(packages[3].version, "3.0.0");
    t.is(packages[4].name, "prod-02-02");
    t.is(packages[4].version, "0.0.2");
    t.is(packages[5].name, "dev-01");
    t.is(packages[5].version, "0.5.0");
    t.is(packages[6].name, "dev-02");
    t.is(packages[6].version, "0.6.0");
});

test.serial("Only production, full installation", async (t) => {
    // Arguments
    sinon.stub(require("../../src/program"), "args").value({ production: true, development: undefined });

    const packages = await getInstalledPackages(path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 5);
    t.is(packages[0].name, "prod-01");
    t.is(packages[0].version, "1.0.0");
    t.is(packages[1].name, "prod-02");
    t.is(packages[1].version, "2.0.0");
    t.is(packages[2].name, "prod-02-02");
    t.is(packages[2].version, "2.0.0");
    t.is(packages[3].name, "prod-03");
    t.is(packages[3].version, "3.0.0");
    t.is(packages[4].name, "prod-02-02");
    t.is(packages[4].version, "0.0.2");
});

test.serial("Only development, full installation", async (t) => {
    // Arguments
    sinon.stub(require("../../src/program"), "args").value({ production: undefined, development: true });

    const packages = await getInstalledPackages(path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 3);
    t.is(packages[0].name, "dev-01");
    t.is(packages[0].version, "0.5.0");
    t.is(packages[1].name, "prod-02-02");
    t.is(packages[1].version, "2.0.0");
    t.is(packages[2].name, "dev-02");
    t.is(packages[2].version, "0.6.0");
});

test.serial("Get all packages, full installation, only direct", async (t) => {
    // Arguments
    sinon.stub(require("../../src/program"), "args").value({ production: undefined, development: undefined, direct: true });

    const packages = await getInstalledPackages(path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 5);
    t.is(packages[0].name, "prod-01");
    t.is(packages[0].version, "1.0.0");
    t.is(packages[1].name, "prod-02");
    t.is(packages[1].version, "2.0.0");
    t.is(packages[2].name, "prod-03");
    t.is(packages[2].version, "3.0.0");
    t.is(packages[3].name, "dev-01");
    t.is(packages[3].version, "0.5.0");
    t.is(packages[4].name, "dev-02");
    t.is(packages[4].version, "0.6.0");
});
