import test from "ava";
import esmock from "esmock";
import sinon from "sinon";

import { Formatter, Report } from "../src/enumerations.js";
import { Text } from "../src/formatters/text.js";
import { Configuration, Package } from "../src/interfaces.js";
import * as reports from "../src/reports/index.js";
import { Summary } from "../src/reports/summary.js";

test.beforeEach((): void => {
    sinon.stub(process.stdout, "write");
    sinon.stub(process.stderr, "write");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("node_modules not found", async (t): Promise<void> => {
    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve(null),
        },
    });

    const r = await main();
    t.false(r);
});

test.serial("Invalid arguments", async (t): Promise<void> => {
    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> => Promise.resolve(null),
        },
    });

    const r = await main();

    t.false(r);
});

test.serial("No packages installed", async (t): Promise<void> => {
    const packages = new Array<Package>();
    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> => Promise.resolve(getMockConfiguration()),
        },
        "../src/npm.js": {
            getInstalledPackages: (): Promise<Array<Package>> => Promise.resolve(packages),
        },
    });

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

    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));
    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> => Promise.resolve(getMockConfiguration()),
        },
        "../src/npm.js": {
            getInstalledPackages: (): Promise<Array<Package>> => Promise.resolve(packages),
        },
        "../src/filters.js": {
            excludePackages: (): Array<Package> => packages,
        },
        "../src/license.js": {
            onlyAllow: (): Array<Package> => packages,
        },
    });

    const r = await main();

    t.true(stubReport.calledOnceWith(Report.summary, Formatter.text));
    t.true(r);
});

test.serial("Not allowed licenses", async (t): Promise<void> => {
    const packages = new Array<Package>();
    packages.push({
        name: "package-01",
        path: "pack-01",
        version: "1.0.0",
        license: "MIT",
        repository: "company/project",
    });

    const stubReport = sinon.stub(reports.Factory, "getInstance").returns(new Summary(new Text()));
    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> =>
                Promise.resolve(
                    getMockConfiguration({
                        allow: ["Apache-2.0"], // Simulate a policy that will fail the compliance checkup
                    }),
                ),
        },
        "../src/npm.js": {
            getInstalledPackages: (): Promise<Array<Package>> => Promise.resolve(packages),
        },
        "../src/filters.js": {
            excludePackages: (): Array<Package> => packages,
        },
        "../src/license.js": {
            onlyAllow: (): Array<Package> => packages,
        },
    });

    const r = await main();

    t.true(stubReport.calledOnceWith(Report.summary, Formatter.text));
    t.false(r);
});

test.serial("Success", async (t): Promise<void> => {
    const packages = new Array<Package>();
    packages.push({
        name: "package-01",
        path: "pack-01",
        version: "1.0.0",
        license: "MIT",
        repository: "company/project",
    });

    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> =>
                Promise.resolve(
                    getMockConfiguration({
                        allow: ["MIT"],
                    }),
                ),
        },
        "../src/npm.js": {
            getInstalledPackages: (): Promise<Array<Package>> => Promise.resolve(packages),
        },
        "../src/filters.js": {
            excludePackages: (): Array<Package> => packages,
        },
        "../src/license.js": {
            onlyAllow: (): Array<Package> => new Array<Package>(),
        },
    });

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

    const { main } = await esmock("../src/main.js", {
        "../src/node-modules.js": {
            getNodeModulesPath: (): Promise<string | null> => Promise.resolve("/"),
        },
        "../src/configuration.js": {
            getConfiguration: (): Promise<Configuration | null> =>
                Promise.resolve(
                    getMockConfiguration({
                        query: ["MIT"],
                    }),
                ),
        },
        "../src/npm.js": {
            getInstalledPackages: (): Promise<Array<Package>> => Promise.resolve(packages),
        },
        "../src/filters.js": {
            excludePackages: (): Array<Package> => packages,
            queryPackages: (): Array<Package> => new Array<Package>(),
        },
        "../src/license.js": {
            onlyAllow: (): Array<Package> => new Array<Package>(),
        },
    });

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
