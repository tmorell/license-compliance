import test from "ava";
import * as path from "path";

import * as util from "../util";
import { LicenseStatus, Literals } from "../../src/enumerations";
import { getLicense } from "../../src/license";
import { NpmPackage } from "../../src/interfaces";

[
    { name: "single-license-01", test: "LICENSE" },
    { name: "single-license-02", test: "LICENSE-MIT" },
].forEach((value): void => {
    test(`In-line single license with ${value.test}`, async (t): Promise<void> => {
        const packPath = path.join(__dirname, "..", "mock-packages", value.name);
        const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

        const license = await getLicense(pack, packPath);
        t.is(license.name, "MIT");
        t.is(license.status, LicenseStatus.valid);
        t.is(license.path, path.join(packPath, value.test));
    });
});

test("In-line single license with no LICENSE", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-03");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("In-line single license with CUSTOM LICENSE", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-04");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, path.join(packPath, "MY-CUSTOM-LICENSE"));
});

test("In-line single license with CUSTOM LICENSE not found", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-05");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, undefined);
});

test("Array valid licenses", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-01");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "(MIT OR Apache-2.0)");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("Array invalid licenses", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-02");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("Array is empty", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-03");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("Array with single entry", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-04");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("No license", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "no-license");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("License type", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "license-type-01");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});
