import test, { after, before } from "ava";
import * as sinon from "sinon";

import { Formatter, Report } from "../../src/enumerations";
import { args, processArgs } from "../../src/program";

before(() => {
    sinon.stub(process, "exit");
    sinon.stub(process.stdout, "write");
});

after(() => {
    sinon.restore();
});

test("No arguments", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value([]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, undefined);
    t.is(args.direct, undefined);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.text);
    t.is(args.production, undefined);
    t.is(args.report, Report.summary);
});

test("Allow, valid licenses", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache-2.0"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow.length, 3);
    t.is(args.allow[0], "MIT");
    t.is(args.allow[1], "ISC");
    t.is(args.allow[2], "Apache-2.0");
});

test("Allow, invalid licenses", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache 2.0"]);

    const r = processArgs();

    t.false(r);
});

test("Development", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--development"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, true);
    t.is(args.direct, undefined);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.text);
    t.is(args.production, undefined);
    t.is(args.report, Report.summary);
});

test("Direct", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--direct"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, undefined);
    t.is(args.direct, true);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.text);
    t.is(args.production, undefined);
    t.is(args.report, Report.summary);
});

test("Exclude", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--exclude", "pack-01;/^@company/;pack-02"]);

    const r = processArgs();

    t.true(r);
    t.is(args.exclude.length, 3);
    t.is(args.exclude[0], "pack-01");
    t.deepEqual(args.exclude[1], /^@company/);
    t.is(args.exclude[2], "pack-02");
});

test("Format", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--format", "json"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, undefined);
    t.is(args.direct, undefined);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.json);
    t.is(args.production, undefined);
    t.is(args.report, Report.summary);
});

test("Format, bad param", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--format", "bad-param"]);

    const r = processArgs();

    t.false(r);
});

test("Production", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--production"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, undefined);
    t.is(args.direct, undefined);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.text);
    t.is(args.production, true);
    t.is(args.report, Report.summary);
});

test("Production or development", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--production", "--development"]);

    const r = processArgs();

    t.false(r);
});

test("Report", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--report", "detailed"]);

    const r = processArgs();

    t.true(r);
    t.is(args.allow, undefined);
    t.is(args.development, undefined);
    t.is(args.direct, undefined);
    t.is(args.exclude, undefined);
    t.is(args.format, Formatter.text);
    t.is(args.production, undefined);
    t.is(args.report, Report.detailed);
});

test("Report, bad param", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--report", "bad-param"]);

    const r = processArgs();

    t.false(r);
});
