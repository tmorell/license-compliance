import test from "ava";
import * as sinon from "sinon";

import { Package } from "../../src/interfaces";
import { onlyAllow } from "../../src/license";

test.after((): void => {
    sinon.restore();
});

test("No licenses to check", (t): void => {
    const packages: Array<Package> = [
        { name: "test-01", path: "test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "3.0.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: [] });

    t.is(invalid.length, 0);
});

test("All packages allowed, single check", (t): void => {
    const packages: Array<Package> = [
        { name: "test-01", path: "test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "2.0.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "3.0.0", license: "MIT", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["MIT"] });

    t.is(invalid.length, 0);
});

test("All packages allowed, multiple checks", (t): void => {
    const packages: Array<Package> = [
        { name: "test-01", path: "test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "3.0.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["Apache-2.0", "ISC", "MIT"] });

    t.is(invalid.length, 0);
});

test("Some packages not allowed, single check", (t): void => {
    const packages: Array<Package> = [
        { name: "test-01", path: "test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "3.0.0", license: "ISC", repository: "company/project" },
        { name: "test-04", path: "test-04", version: "4.0.0", license: "BSD-2-Clause", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["ISC"] });

    t.is(invalid.length, 3);
    t.is(invalid[0].name, "test-01");
    t.is(invalid[1].name, "test-02");
    t.is(invalid[2].name, "test-04");
});

test("Some packages not allowed, multiple checks", (t): void => {
    const packages: Array<Package> = [
        { name: "test-01", path: "test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "3.0.0", license: "ISC", repository: "company/project" },
        { name: "test-04", path: "test-04", version: "4.0.0", license: "BSD-2-Clause", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["MIT", "ISC"] });

    t.is(invalid.length, 2);
    t.is(invalid[0].name, "test-02");
    t.is(invalid[1].name, "test-04");
});

test("All packages allowed, OR licenses", (t): void => {
    const packages: Array<Package> = [
        {
            name: "test-01",
            path: "test-01",
            version: "1.0.0",
            license: "(MIT OR Apache-2.0)",
            repository: "company/project",
        },
        {
            name: "test-02",
            path: "test-02",
            version: "2.0.0",
            license: "(BSD-2-Clause OR MIT)",
            repository: "company/project",
        },
        {
            name: "test-03",
            path: "test-03",
            version: "3.0.0",
            license: "(MIT OR BSD-2-Clause OR Apache-2.0)",
            repository: "company/project",
        },
        { name: "test-04", path: "test-04", version: "4.0.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["MIT", "ISC"] });

    t.is(invalid.length, 0);
});

test("Some packages not allowed, OR licenses", (t): void => {
    const packages: Array<Package> = [
        {
            name: "test-01",
            path: "test-01",
            version: "1.0.0",
            license: "(MIT OR Apache-2.0)",
            repository: "company/project",
        },
        {
            name: "test-02",
            path: "test-02",
            version: "2.0.0",
            license: "(BSD-2-Clause OR MIT)",
            repository: "company/project",
        },
        {
            name: "test-03",
            path: "test-03",
            version: "3.0.0",
            license: "(MIT OR BSD-2-Clause OR Apache-2.0)",
            repository: "company/project",
        },
        { name: "test-04", path: "test-04", version: "4.0.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["MIT", "BSD-3-Clause"] });

    t.is(invalid.length, 1);
    t.is(invalid[0].name, "test-04");
});

test("Doesn't choke on invalid SPDX", (t): void => {
    const packages: Array<Package> = [
        {
            name: "test-01",
            path: "test-01",
            version: "1.0.0",
            license: "MIT or Apache-2.0",
            repository: "company/project",
        },
    ];

    // Arguments
    const invalid = onlyAllow(packages, { allow: ["MIT"] });

    t.is(invalid.length, 1);
    t.is(invalid[0].name, "test-01");
});
