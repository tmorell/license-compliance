import test, { after, before } from "ava";
import * as sinon from "sinon";

import { Formatter, Report } from "../../src/enumerations";
import { processArgs } from "../../src/program";
// import { configuration } from "../../src/main";

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

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, undefined);
    t.is(configuration?.direct, undefined);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.text);
    t.is(configuration?.production, undefined);
    t.is(configuration?.report, Report.summary);
});

test("Allow, valid licenses", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache-2.0"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow.length, 3);
    t.is(configuration?.allow[0], "MIT");
    t.is(configuration?.allow[1], "ISC");
    t.is(configuration?.allow[2], "Apache-2.0");
});

test("Allow, invalid licenses", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache 2.0"]);

    const configuration = processArgs();

    t.is(configuration, null);
});

test("Development", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--development"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, true);
    t.is(configuration?.direct, undefined);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.text);
    t.is(configuration?.production, undefined);
    t.is(configuration?.report, Report.summary);
});

test("Direct", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--direct"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, undefined);
    t.is(configuration?.direct, true);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.text);
    t.is(configuration?.production, undefined);
    t.is(configuration?.report, Report.summary);
});

test("Exclude", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--exclude", "pack-01;/^@company/;pack-02"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.exclude.length, 3);
    t.is(configuration?.exclude[0], "pack-01");
    t.deepEqual(configuration?.exclude[1], /^@company/);
    t.is(configuration?.exclude[2], "pack-02");
});

test("Format", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--format", "json"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, undefined);
    t.is(configuration?.direct, undefined);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.json);
    t.is(configuration?.production, undefined);
    t.is(configuration?.report, Report.summary);
});

test("Format, bad param", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--format", "bad-param"]);

    const configuration = processArgs();

    t.is(configuration, null);
});

test("Production", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--production"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, undefined);
    t.is(configuration?.direct, undefined);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.text);
    t.is(configuration?.production, true);
    t.is(configuration?.report, Report.summary);
});

test("Production or development", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--production", "--development"]);

    const r = processArgs();

    t.is(r, null);
});

test("Report", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--report", "detailed"]);

    const configuration = processArgs();

    // t.true(r);
    t.is(configuration?.allow, undefined);
    t.is(configuration?.development, undefined);
    t.is(configuration?.direct, undefined);
    t.is(configuration?.exclude, undefined);
    t.is(configuration?.format, Formatter.text);
    t.is(configuration?.production, undefined);
    t.is(configuration?.report, Report.detailed);
});

test("Report, bad param", (t) => {
    // tslint:disable-next-line: no-unsafe-any
    sinon.stub(process, "argv").value(["", "", "--report", "bad-param"]);

    const configuration = processArgs();

    t.is(configuration, null);
});
