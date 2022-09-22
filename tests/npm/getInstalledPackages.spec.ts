import test from "ava";
import * as path from "path";
import * as sinon from "sinon";

import { getDefaultConfiguration } from "../util";
import { getInstalledPackages } from "../../src/npm";
import { Literals } from "../../src/enumerations";

test.before((): void => {
    sinon.stub(console, "error");
});

test.after((): void => {
    sinon.restore();
});

test.serial("Get packages, empty package.json", async (t): Promise<void> => {
    const packages = await getInstalledPackages(getDefaultConfiguration(), path.join(__dirname, "..", "mock-packages", "installation-empty"));

    t.is(packages.length, 0);
});

test.serial("Analyze library own packages. No mocking", async (t): Promise<void> => {
    const packages = await getInstalledPackages(getDefaultConfiguration());

    // Real npm install testing the it works on root folder
    // Number of packages might change
    t.truthy(packages.length > 400);
});

test.serial("Get all packages, full installation", async (t): Promise<void> => {
    const packages = await getInstalledPackages(getDefaultConfiguration(), path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 11);
    t.truthy(packages.find((p): boolean => p.name === "prod-01" && p.version === "1.0.0" && p.repository === "https://github.com/user/project"));
    t.truthy(packages.find((p): boolean => p.name === "prod-03" && p.version === "3.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02" && p.version === "2.0.0" && p.repository === Literals.UNKNOWN));
    t.truthy(packages.find((p): boolean => p.name === "@comp-01/core" && p.version === "0.5.6"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02-02" && p.version === "0.0.2"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02-02" && p.version === "2.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-05-05" && p.version === "6.7.8"));
    t.truthy(packages.find((p): boolean => p.name === "prod-04-04" && p.version === "0.3.2"));
    t.truthy(packages.find((p): boolean => p.name === "prod-04" && p.version === "1.2.3"));
    t.truthy(packages.find((p): boolean => p.name === "dev-01" && p.version === "0.5.0"));
    t.truthy(packages.find((p): boolean => p.name === "dev-02" && p.version === "0.6.0"));
});

test.serial("Only production, full installation", async (t): Promise<void> => {
    const packages = await getInstalledPackages(Object.assign(getDefaultConfiguration(), { production: true }),
        path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 9);
    t.truthy(packages.find((p): boolean => p.name === "prod-01" && p.version === "1.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02" && p.version === "2.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02-02" && p.version === "2.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-03" && p.version === "3.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "@comp-01/core" && p.version === "0.5.6"));
    t.truthy(packages.find((p): boolean => p.name === "prod-05-05" && p.version === "6.7.8"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02-02" && p.version === "0.0.2"));
    t.truthy(packages.find((p): boolean => p.name === "prod-04-04" && p.version === "0.3.2"));
    t.truthy(packages.find((p): boolean => p.name === "prod-04" && p.version === "1.2.3"));
});

test.serial("Only development, full installation", async (t): Promise<void> => {
    const packages = await getInstalledPackages(Object.assign(getDefaultConfiguration(), { development: true }),
        path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 3);
    t.truthy(packages.find((p): boolean => p.name === "dev-01" && p.version === "0.5.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02-02" && p.version === "2.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "dev-02" && p.version === "0.6.0"));
});

test.serial("Get all packages, full installation, only direct", async (t): Promise<void> => {
    const packages = await getInstalledPackages(Object.assign(getDefaultConfiguration(), { direct: true }),
        path.join(__dirname, "..", "mock-packages", "installation-full"));

    t.is(packages.length, 5);
    t.truthy(packages.find((p): boolean => p.name === "prod-01" && p.version === "1.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-02" && p.version === "2.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "prod-03" && p.version === "3.0.0"));
    t.truthy(packages.find((p): boolean => p.name === "dev-01" && p.version === "0.5.0"));
    t.truthy(packages.find((p): boolean => p.name === "dev-02" && p.version === "0.6.0"));
});
