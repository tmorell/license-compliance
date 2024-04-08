import test from "ava";
import * as sinon from "sinon";

import * as configuration from "../src/configuration";
import { Formatter, Report } from "../src/enumerations";
import * as filters from "../src/filters";
import { Text } from "../src/formatters/text";
import { Configuration, Package } from "../src/interfaces";
import * as license from "../src/license";
import { main } from "../src/main";
import * as npm from "../src/npm";
import * as reports from "../src/reports";
import { Summary } from "../src/reports/summary";

test.beforeEach((): void => {
    sinon.stub(process.stdout, "write");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("Invalid arguments", async (t): Promise<void> => {
    sinon.stub(configuration, "getConfiguration").returns(Promise.resolve(null));

    const r = await main();

    t.false(r);
});

test.serial("No packages installed", async (t): Promise<void> => {
    const packages = new Array<Package>();
    sinon.stub(configuration, "getConfiguration").returns(Promise.resolve(getMockConfiguration()));
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages)); // No packages were found

    const r = await main();

    t.true(r);
});

test.serial("Get licenses summary", async (t): Promise<void> => {
    const packages = new Array<Package>();
    packages.push({
        name: "package-01",
        path: "pack-01",
        version: "1.0.0",
        license: "MIT",
        repository: "company/project",
    });

    sinon.stub(configuration, "getConfiguration").returns(Promise.resolve(getMockConfiguration()));
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(packages);
    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));

    const r = await main();

    t.true(stubReport.calledOnceWith(Report.summary, Formatter.text));
    t.true(r);
});

// test.serial("Not allowed licenses", async (t): Promise<void> => {
//     const packages = new Array<Package>();
//     packages.push({ name: "package-01", path: "pack-01", version: "1.0.0", license: "MIT", repository: "company/project" });

//     sinon.stub(configuration, "getConfiguration").returns(Promise.resolve(getMockConfiguration({
//         allow: ["Apache-2.0"], // Simulate a policy that will fail the compliance checkup
//     })));
//     sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
//     sinon.stub(filters, "excludePackages").returns(packages);
//     sinon.stub(license, "onlyAllow").returns(packages); // Packages with not allowed licenses found
//     const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));

//     const r = await main();

//     t.true(stubReport.calledOnceWith(Report.summary, Formatter.text));
//     t.false(r);
// });

test.serial("Success", async (t): Promise<void> => {
    const packages = new Array<Package>();
    packages.push({
        name: "package-01",
        path: "pack-01",
        version: "1.0.0",
        license: "MIT",
        repository: "company/project",
    });

    sinon.stub(configuration, "getConfiguration").returns(
        Promise.resolve(
            getMockConfiguration({
                allow: ["MIT"],
            }),
        ),
    );
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(license, "onlyAllow").returns(new Array<Package>());
    const r = await main();

    t.true(r);
});

test.serial("Success query", async (t): Promise<void> => {
    const packages = new Array<Package>();
    packages.push({
        name: "package-01",
        path: "pack-01",
        version: "1.0.0",
        license: "MIT",
        repository: "company/project",
    });

    sinon.stub(configuration, "getConfiguration").returns(
        Promise.resolve(
            getMockConfiguration({
                query: ["MIT"],
            }),
        ),
    );
    sinon.stub(npm, "getInstalledPackages").returns(Promise.resolve(packages));
    sinon.stub(filters, "excludePackages").returns(packages);
    sinon.stub(filters, "queryPackages").returns(new Array<Package>());
    const r = await main();

    t.true(r);
});

function getMockConfiguration(overrideConfiguration?: Partial<Configuration>): Configuration {
    return Object.assign(
        {
            allow: [],
            development: false,
            direct: false,
            exclude: [],
            format: Formatter.text,
            production: false,
            query: [],
            report: Report.summary,
        },
        overrideConfiguration,
    );
}
