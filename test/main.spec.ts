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

beforeEach(() => {
    sinon.stub(process.stdout, "write");
});

afterEach(() => {
    sinon.restore();
});

test.serial("Invalid arguments", async (t) => {
    sinon.stub(program, "processArgs").returns(false);  // Invalid arguments were provided

    const r = await main();

    t.false(r);
});

test.serial("No packages installed", async (t) => {
    const packages = new Array<Package>();
    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages)); // No packages were found

    const r = await main();

    t.false(r);
});

test.serial("Not allowed licenses", async (t) => {
    const packages = new Array<Package>();
    packages.push({ name: "package-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" });
    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(packages);  // Packages with not allowed licenses found
    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Invalid(new Text()));

    const r = await main();

    t.true(stubReport.calledOnceWith(Report.invalid));
    t.false(r);
});

test.serial("Success", async (t) => {
    const packages = new Array<Package>();
    packages.push({ name: "package-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" });

    sinon.stub(program, "processArgs").returns(true);
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(new Array<Package>());
    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));

    const r = await main();

    t.true(stubReport.calledOnceWith());
    t.true(r);
});
