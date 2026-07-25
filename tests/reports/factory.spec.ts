import test from "ava";

import { Formatter, Report } from "../../src/enumerations.js";
import { Detailed } from "../../src/reports/detailed.js";
import { Factory } from "../../src/reports/factory.js";
import { Summary } from "../../src/reports/summary.js";

test("Detail", (t): void => {
    const report = Factory.getInstance(Report.detailed, Formatter.text);

    t.true(report instanceof Detailed);
});

test("Summary", (t): void => {
    const report = Factory.getInstance(Report.summary, Formatter.text);

    t.true(report instanceof Summary);
});
