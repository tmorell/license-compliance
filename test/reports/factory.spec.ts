import test from "ava";
import * as sinon from "sinon";

import { Factory } from "../../src/reports";
import { Detailed } from "../../src/reports/detailed";
import { Invalid } from "../../src/reports/invalid";
import { Summary } from "../../src/reports/summary";

test("Detail", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Text", report: "Detailed" });

    const report = Factory.getInstance();

    t.true(report instanceof Detailed);
});

test("Invalid", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Text", report: "Invalid" });

    const report = Factory.getInstance();

    t.true(report instanceof Invalid);
});

test("Summary", (t) => {
    sinon.stub(require("../../src/main"), "configuration").value({ format: "Text", report: "Summary" });

    const report = Factory.getInstance();

    t.true(report instanceof Summary);
});
