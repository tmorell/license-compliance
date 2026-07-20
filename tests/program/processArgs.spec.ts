import test from "ava";
import * as sinon from "sinon";

import { Formatter, Report } from "../../src/enumerations";
import { processArgs } from "../../src/program";

test.before((): void => {
    sinon.stub(process.stdout, "write");
    sinon.stub(process.stderr, "write");
});

test.after((): void => {
    sinon.restore();
});

test("No arguments", (t): void => {
    sinon.stub(process, "argv").value([]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development === undefined);
    t.true(configuration.direct === undefined);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === undefined);
    t.true(configuration.production === undefined);
    t.true(configuration.report === undefined);
});

test("Allow, valid licenses", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache-2.0"]);

    const configuration = processArgs();

    t.is(configuration.allow.length, 3);
    t.is(configuration.allow[0], "MIT");
    t.is(configuration.allow[1], "ISC");
    t.is(configuration.allow[2], "Apache-2.0");
});

test("Allow, invalid licenses", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache 2.0"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.true(error.message.includes("error: option '-a, --allow <licenses>' argument 'MIT;ISC;Apache 2.0' is invalid"));
});

test("Development", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--development"]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development);
    t.true(configuration.direct === undefined);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === undefined);
    t.true(configuration.production === undefined);
    t.true(configuration.report === undefined);
});

test("Direct", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--direct"]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development === undefined);
    t.true(configuration.direct);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === undefined);
    t.true(configuration.production === undefined);
    t.true(configuration.report === undefined);
});

test("Exclude", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--exclude", "pack-01;/^@company/;pack-02"]);

    const configuration = processArgs();

    t.is(configuration.exclude.length, 3);
    t.is(configuration.exclude[0], "pack-01");
    t.deepEqual(configuration.exclude[1], /^@company/);
    t.is(configuration.exclude[2], "pack-02");
});

test("Format", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--format", "json"]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development === undefined);
    t.true(configuration.direct === undefined);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === Formatter.json.toLowerCase());
    t.true(configuration.production === undefined);
    t.true(configuration.report === undefined);
});

test("Format, bad param", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--format", "bad-param"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.is(
        error?.message,
        "error: option '-f, --format <format>' argument 'bad-param' is invalid. Allowed choices are csv, json, text, xunit.",
    );
});

test("Production", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--production"]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development === undefined);
    t.true(configuration.direct === undefined);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === undefined);
    t.true(configuration.production);
    t.true(configuration.report === undefined);
});

test("Production and development", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--production", "--development"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.is(error?.message, "error: option '-d, --development' cannot be used with option '-p, --production'");
});

test("Query UNKNOWN", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--query", "MIT;UNKNOWN"]);

    const configuration = processArgs();

    t.is(configuration.query.length, 2);
    t.is(configuration.query[0], "MIT");
    t.is(configuration.query[1], "UNKNOWN");
});

test("Query and allow", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT", "--query", "MIT"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.is(error?.message, "error: option '-a, --allow <licenses>' cannot be used with option '-q, --query <licenses>'");
});

test("Query, invalid licenses", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--query", "MIT;ISC;Apache 2.0"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.true(error.message.includes("error: option '-q, --query <licenses>' argument 'MIT;ISC;Apache 2.0' is invalid."));
});

test("Report", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--report", "detailed"]);

    const configuration = processArgs();

    t.true(configuration.allow === undefined);
    t.true(configuration.development === undefined);
    t.true(configuration.direct === undefined);
    t.true(configuration.exclude === undefined);
    t.true(configuration.format === undefined);
    t.true(configuration.production === undefined);
    t.true(configuration.report === Report.detailed.toLowerCase());
});

test("Report, bad param", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--report", "bad-param"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.is(
        error?.message,
        "error: option '-r, --report <report>' argument 'bad-param' is invalid. Allowed choices are detailed, summary.",
    );
});

test("Invalid RegEx", (t): void => {
    sinon.stub(process, "argv").value(["", "", "--exclude", "/[a-z/"]);

    const error = t.throws((): void => {
        processArgs();
    });

    t.is(
        error?.message,
        "error: option '-e, --exclude <packages>' argument '/[a-z/' is invalid. Invalid regular expression pattern.",
    );
});
