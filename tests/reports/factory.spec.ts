import test from "ava";

import { Format, Report } from "../../src/enumerations.js";
import { Detailed } from "../../src/reports/detailed.js";
import { Factory } from "../../src/reports/factory.js";
import { Summary } from "../../src/reports/summary.js";

test("Detail", (t): void => {
    const report = Factory.getInstance(Report.detailed, Format.text);

    t.true(report instanceof Detailed);
});

test("Summary", (t): void => {
    const report = Factory.getInstance(Report.summary, Format.text);

    t.true(report instanceof Summary);
});

test("Invalid", (t): void => {
    const error = t.throws((): void => {
        Factory.getInstance("Invalid", Format.text);
    });

    t.is(error.message, "Invalid report type: 'Invalid'");
});
