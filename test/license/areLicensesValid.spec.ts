import test from "ava";

import { areLicensesAllowed } from "../../src/license";
import { Package } from "../../src/interfaces";

test("Single simple licenses", (t) => {
    const packages: Array<Package> = [
        { name: "test-01", license: "MIT" },
        { name: "test-02", license: "MIT" },
        { name: "test-03", license: "MIT" }
    ];

    let invPack = areLicensesAllowed(packages, ["MIT"]);
    t.is(invPack.length, 0);

    invPack = areLicensesAllowed(packages, ["BSD-2-Clause"]);
    t.is(invPack.length, 3);
    t.is(invPack[0].name, "test-01");
    t.is(invPack[1].name, "test-02");
    t.is(invPack[2].name, "test-03");
});

test("Multiple simple licenses", (t) => {
    const packages: Array<Package> = [
        { name: "test-01", license: "MIT" },
        { name: "test-02", license: "Apache-2.0" },
        { name: "test-03", license: "BSD-2-Clause" },
        { name: "test-04", license: "MIT" }
    ];

    let invPack = areLicensesAllowed(packages, ["MIT", "Apache-2.0", "BSD-2-Clause"]);
    t.is(invPack.length, 0);

    invPack = areLicensesAllowed(packages, ["MIT"]);
    t.is(invPack.length, 2);
    t.is(invPack[0].name, "test-02");
    t.is(invPack[1].name, "test-03");

    invPack = areLicensesAllowed(packages, ["Apache-2.0"]);
    t.is(invPack.length, 3);
    t.is(invPack[0].name, "test-01");
    t.is(invPack[1].name, "test-03");
    t.is(invPack[2].name, "test-04");

    invPack = areLicensesAllowed(packages, ["BSD-2-Clause"]);
    t.is(invPack.length, 3);
    t.is(invPack[0].name, "test-01");
    t.is(invPack[1].name, "test-02");
    t.is(invPack[2].name, "test-04");

    invPack = areLicensesAllowed(packages, ["MIT", "BSD-2-Clause"]);
    t.is(invPack.length, 1);
    t.is(invPack[0].name, "test-02");
});

test("OR licenses", (t) => {
    const packages: Array<Package> = [
        { name: "test-01", license: "(MIT OR Apache-2.0)" },
        { name: "test-02", license: "(BSD-2-Clause OR MIT)" },
        { name: "test-03", license: "(MIT OR BSD-2-Clause OR Apache-2.0)" },
        { name: "test-04", license: "MIT" },
    ];

    let invPack = areLicensesAllowed(packages, ["MIT"]);
    t.is(invPack.length, 0);

    invPack = areLicensesAllowed(packages, ["Apache-2.0"]);
    t.is(invPack.length, 2);
    t.is(invPack[0].name, "test-02");
    t.is(invPack[1].name, "test-04");

    invPack = areLicensesAllowed(packages, ["BSD-2-Clause"]);
    t.is(invPack.length, 2);
    t.is(invPack[0].name, "test-01");
    t.is(invPack[1].name, "test-04");
});
