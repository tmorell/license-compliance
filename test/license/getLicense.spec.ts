import test from "ava";
import * as path from "path";

import * as util from "../util";
import { getLicense, UNKNOWN } from "../../src/license";
import { LicenseStatus } from "../../src/enumerations";
import { NpmPackage } from "../../src/interfaces";

[
    { name: "single-license-01", test: "LICENSE" },
    { name: "single-license-02", test: "LICENSE-MIT" }
].forEach((value) => {
    test(`In-line single license with ${value.test}`, async (t) => {
        const packPath = path.join(__dirname, "..", "mock-packages", value.name);
        const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

        const license = await getLicense(pack, packPath);
        t.is(license.name, "MIT");
        t.is(license.status, LicenseStatus.valid);
        t.is(license.path, path.join(packPath, value.test));
    });
});

test("In-line single license with no LICENSE", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-03");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("In-line single license with CUSTOM LICENSE", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-04");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "CUSTOM");
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, path.join(packPath, "MY-CUSTOM-LICENSE"));
});

test("In-line single license with CUSTOM LICENSE not found", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "single-license-05");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "CUSTOM");
    t.is(license.status, LicenseStatus.custom);
    t.is(license.path, undefined);
});

test("Array valid licenses", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-01");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "(MIT OR Apache-2.0)");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("Array invalid licenses", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-02");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("Array is empty", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-03");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("Array with single entry", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "array-license-04");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});

test("No license", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "no-license");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, UNKNOWN);
    t.is(license.status, LicenseStatus.unknown);
    t.is(license.path, undefined);
});

test("License type", async (t) => {
    const packPath = path.join(__dirname, "..", "mock-packages", "license-type-01");
    const pack = util.readJson(path.join(packPath, "package.json")) as NpmPackage;

    const license = await getLicense(pack, packPath);
    t.is(license.name, "MIT");
    t.is(license.status, LicenseStatus.valid);
    t.is(license.path, undefined);
});
