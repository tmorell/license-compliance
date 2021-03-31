import test from "ava";
import { Formatter, Report } from "../../src/enumerations";

import { Factory } from "../../src/reports";
import { Detailed } from "../../src/reports/detailed";
import { Summary } from "../../src/reports/summary";

test("Detail", (t) => {
    const report = Factory.getInstance(Report.detailed, Formatter.text);

    t.true(report instanceof Detailed);
});

test("Summary", (t) => {
    const report = Factory.getInstance(Report.summary, Formatter.text);

    t.true(report instanceof Summary);
});
