import test, { after } from "ava";
import * as sinon from "sinon";

import { excludePackages } from "../../src/filters";
import { Package } from "../../src/interfaces";

after(() => {
    sinon.restore();
});

test("No filters", (t) => {
    const packages: Array<Package> = [
        { name: "@company/test-01", path: "@company/test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "@company/test-02", path: "@company/test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-01", path: "test-01", version: "1.1.0", license: "ISC", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "1.2.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "1.3.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const filtered = excludePackages(packages, { exclude: [] });

    t.is(filtered.length, 5);
});

test("By package names", (t) => {
    const packages: Array<Package> = [
        { name: "@company/test-01", path: "@company/test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "@company/test-02", path: "@company/test-02", version: "1.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-01", path: "test-01", version: "1.1.0", license: "ISC", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "1.2.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "1.3.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const filtered = excludePackages(packages, { exclude: ["test-01", "@company/test-02"] });

    t.is(filtered.length, 3);
    t.is(filtered[0].name, "@company/test-01");
    t.is(filtered[1].name, "test-02");
    t.is(filtered[2].name, "test-03");
});

test("Regex", (t) => {
    const packages: Array<Package> = [
        { name: "@company/test-01", path: "@company/test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "@company/test-02", path: "@company/test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-01", path: "test-01", version: "1.1.0", license: "ISC", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "1.2.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "1.3.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const filtered = excludePackages(packages, { exclude: [/^@company/] });

    t.is(filtered.length, 3);
    t.is(filtered[0].name, "test-01");
    t.is(filtered[1].name, "test-02");
    t.is(filtered[2].name, "test-03");
});

test("Regex and string", (t) => {
    const packages: Array<Package> = [
        { name: "@company/test-01", path: "@company/test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "@company/test-02", path: "@company/test-02", version: "2.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-01", path: "test-01", version: "1.1.0", license: "ISC", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "1.2.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "1.3.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const filtered = excludePackages(packages, { exclude: [/^@company/, "test-02"] });

    t.is(filtered.length, 2);
    t.is(filtered[0].name, "test-01");
    t.is(filtered[1].name, "test-03");
});
