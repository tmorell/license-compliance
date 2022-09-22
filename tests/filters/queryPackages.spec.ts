import test from "ava";
import * as sinon from "sinon";

import { queryPackages } from "../../src/filters";
import { Package } from "../../src/interfaces";

test.after((): void => {
    sinon.restore();
});

test("By package names", (t): void => {
    const packages: Array<Package> = [
        { name: "@company/test-01", path: "@company/test-01", version: "1.0.0", license: "MIT", repository: "company/project" },
        { name: "@company/test-02", path: "@company/test-02", version: "1.0.0", license: "Apache-2.0", repository: "company/project" },
        { name: "test-01", path: "test-01", version: "1.1.0", license: "BSD", repository: "company/project" },
        { name: "test-02", path: "test-02", version: "1.2.0", license: "MIT", repository: "company/project" },
        { name: "test-03", path: "test-03", version: "1.3.0", license: "ISC", repository: "company/project" },
    ];

    // Arguments
    const filtered = queryPackages(packages, { query: ["MIT", "ISC"] });

    t.is(filtered.length, 3);
    t.is(filtered[0].name, "@company/test-01");
    t.is(filtered[1].name, "test-02");
    t.is(filtered[2].name, "test-03");
});
