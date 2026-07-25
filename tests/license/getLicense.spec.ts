import test from "ava";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LicenseStatus, Literals } from "../../src/enumerations.js";
import { NpmPackage } from "../../src/interfaces.js";
import { getLicense } from "../../src/license.js";
import * as util from "../util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    t.is(license.path, null);
});

test("Array valid licenses", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-01");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "(MIT OR Apache-2.0)");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, null);
});

test("Array invalid licenses", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-02");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, null);
});

test("Array is empty", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-03");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, null);
});

test("Array with single entry", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-04");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, null);
});

test("No license", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "no-license");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, null);
});

test("License type", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "license-type-01");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, null);
});

test("CUSTOM LICENSE valid at root", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "custom-license-root");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, path.join(packPath, "MY-CUSTOM-LICENSE"));
    t.regex(license.path + "", /mock-packages\/custom-license-root\/MY-CUSTOM-LICENSE/);
});

test("CUSTOM LICENSE valid nested", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "custom-license-nested");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.regex(license.path + "", /mock-packages\/custom-license-nested\/docs\/MY-CUSTOM-LICENSE/);
});

test("CUSTOM LICENSE path transversal found", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "custom-license-transversal");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, "Path Transversal found (blocked)");
});

test("CUSTOM LICENSE not existent", async (t): Promise<void> => {
    const packPath = path.join(__dirname, "..", "mock-packages", "custom-license-non-existent");
    const pack = <NpmPackage>util.readJson(path.join(packPath, "package.json"));

    const license = await getLicense(pack, packPath);
    t.is(license.name, Literals.CUSTOM);
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, null);
});
