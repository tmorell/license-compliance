import test, { after, before } from "ava";
import * as sinon from "sinon";

import { Formatter, Report } from "../../src/enumerations";
import { processArgs } from "../../src/program";

before(() => {
    sinon.stub(process.stdout, "write");
});

after(() => {
    sinon.restore();
});

test("No arguments", (t) => {
    sinon.stub(process, "argv").value([]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, undefined);
    t.is(configuration.direct, undefined);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, undefined);
    t.is(configuration.production, undefined);
    t.is(configuration.report, undefined);
});

test("Allow, valid licenses", (t) => {
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache-2.0"]);

    const configuration = processArgs();

    t.is(configuration.allow.length, 3);
    t.is(configuration.allow[0], "MIT");
    t.is(configuration.allow[1], "ISC");
    t.is(configuration.allow[2], "Apache-2.0");
});

test("Allow, invalid licenses", (t) => {
    sinon.stub(process, "argv").value(["", "", "--allow", "MIT;ISC;Apache 2.0"]);
    const stubProcess = sinon.stub(process, "exit");

    processArgs();

    t.true(stubProcess.calledTwice);
    stubProcess.restore();
});

test("Development", (t) => {
    sinon.stub(process, "argv").value(["", "", "--development"]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, true);
    t.is(configuration.direct, undefined);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, undefined);
    t.is(configuration.production, undefined);
    t.is(configuration.report, undefined);
});

test("Direct", (t) => {
    sinon.stub(process, "argv").value(["", "", "--direct"]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, undefined);
    t.is(configuration.direct, true);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, undefined);
    t.is(configuration.production, undefined);
    t.is(configuration.report, undefined);
});

test("Exclude", (t) => {
    sinon.stub(process, "argv").value(["", "", "--exclude", "pack-01;/^@company/;pack-02"]);

    const configuration = processArgs();

    t.is(configuration.exclude.length, 3);
    t.is(configuration.exclude[0], "pack-01");
    t.deepEqual(configuration.exclude[1], /^@company/);
    t.is(configuration.exclude[2], "pack-02");
});

test("Format", (t) => {
    sinon.stub(process, "argv").value(["", "", "--format", "json"]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, undefined);
    t.is(configuration.direct, undefined);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, Formatter.json.toLowerCase());
    t.is(configuration.production, undefined);
    t.is(configuration.report, undefined);
});

test("Format, bad param", (t) => {
    sinon.stub(process, "argv").value(["", "", "--format", "bad-param"]);
    const stubProcess = sinon.stub(process, "exit");

    processArgs();

    t.true(stubProcess.calledTwice);
    stubProcess.restore();
});

test("Production", (t) => {
    sinon.stub(process, "argv").value(["", "", "--production"]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, undefined);
    t.is(configuration.direct, undefined);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, undefined);
    t.is(configuration.production, true);
    t.is(configuration.report, undefined);
});

test("Production or development", (t) => {
    sinon.stub(process, "argv").value(["", "", "--production", "--development"]);
    const stubProcess = sinon.stub(process, "exit");

    processArgs();

    t.true(stubProcess.calledTwice);
    stubProcess.restore();
});

test("Report", (t) => {
    sinon.stub(process, "argv").value(["", "", "--report", "detailed"]);

    const configuration = processArgs();

    t.is(configuration.allow, undefined);
    t.is(configuration.development, undefined);
    t.is(configuration.direct, undefined);
    t.is(configuration.exclude, undefined);
    t.is(configuration.format, undefined);
    t.is(configuration.production, undefined);
    t.is(configuration.report, (Report.detailed as string).toLowerCase());
});

test("Report, bad param", (t) => {
    sinon.stub(process, "argv").value(["", "", "--report", "bad-param"]);
    const stubProcess = sinon.stub(process, "exit");

    processArgs();

    t.true(stubProcess.calledTwice);
    stubProcess.restore();
});
