import test, { afterEach, beforeEach } from "ava";
import * as sinon from "sinon";

import { Report } from "../src/enumerations";
import * as filters from "../src/filters";
import { Text } from "../src/formatters/text";
import { Package } from "../src/interfaces";
import * as license from "../src/license";
import { main } from "../src/main";
import * as npm from "../src/npm";
import * as program from "../src/program";
import * as reports from "../src/reports";
import { Invalid } from "../src/reports/invalid";
import { Summary } from "../src/reports/summary";

let stubExit: sinon.SinonStub;

beforeEach(() => {
    stubExit = sinon.stub(process, "exit");
    sinon.stub(process.stdout, "write");
});

afterEach(() => {
    sinon.restore();
});

test.serial("Invalid arguments", async (t) => {
    sinon.stub(program, "processArgs").returns(false);  // Invalid arguments were provided

    await main();

    t.true(stubExit.calledOnceWith(1));
});

test.serial("No packages installed", async (t) => {
    const packages = new Array<Package>();
    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages)); // No packages were found

    await main();

    t.true(stubExit.calledOnceWith(1));
});

test.serial("Not allowed licenses", async (t) => {
    const packages = new Array<Package>();
    packages.push({ name: "package-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" });
    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(packages);  // Packages with not allowed licenses found
    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Invalid(new Text()));

    await main();

    t.true(stubReport.calledOnceWith(Report.invalid));
    t.true(stubExit.calledOnceWith(1));
});

test.serial("Success", async (t) => {
    const packages = new Array<Package>();
    packages.push({ name: "package-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" });

    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(new Array<Package>());
    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));

    await main();

    t.true(stubReport.calledOnceWith());
    t.true(stubExit.calledOnceWith(0));
});
