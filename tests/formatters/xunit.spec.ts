import test from "ava";
import * as sinon from "sinon";

import { Xunit } from "../../src/formatters/xunit";
import { Package } from "../../src/interfaces";

let stubConsole: sinon.SinonStub;

test.beforeEach(() => {
    stubConsole = sinon.stub(console, "info");
});

test.afterEach(() => {
    sinon.restore();
});

test.serial("Detailed", (t) => {
    const packages: Array<Package> = [
        { name: "pack-01", path: "pack-01", version: "1.1.0", license: "MIT", repository: "company/project" },
        { name: "pack-02", path: "pack-02", version: "2.2.0", license: "MIT", repository: "company/project2" },
        { name: "pack-03", path: "pack-03", version: "0.0.3", license: "Unknown", repository: "company/project-3" },
    ];

    const xunit = new Xunit();
    xunit.detail(packages);

    t.true(stubConsole.calledWithExactly(`<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="License Compliance" tests="3" errors="0" failures="3">
  <testsuite name="MIT" tests="2" errors="0" failures="2">
    <testcase name="pack-01@1.1.0" path="pack-01">
      <failure type="License Compliance Error">Package &quot;pack-01@1.1.0&quot; uses non compliant license &quot;MIT&quot;</failure>
    </testcase>
    <testcase name="pack-02@2.2.0" path="pack-02">
      <failure type="License Compliance Error">Package &quot;pack-02@2.2.0&quot; uses non compliant license &quot;MIT&quot;</failure>
    </testcase>
  </testsuite>
  <testsuite name="Unknown" tests="1" errors="0" failures="1">
    <testcase name="pack-03@0.0.3" path="pack-03">
      <failure type="License Compliance Error">Package &quot;pack-03@0.0.3&quot; uses non compliant license &quot;Unknown&quot;</failure>
    </testcase>
  </testsuite>
</testsuites>`));
});

test.serial("Summary", (t) => {
    const licenses: Array<{ name: string; count: number }> = [
        { name: "MIT", count: 9 },
        { name: "Apache-2.0", count: 1 },
    ];

    const xunit = new Xunit();
    xunit.summary(licenses);

    t.true(stubConsole.calledWithExactly(`<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="License Compliance" tests="2" errors="0" failures="2">
  <testsuite name="MIT" tests="1" errors="0" failures="1">
    <testcase name="MIT">
      <failure type="License Compliance Error">9 packages use non compliant license &quot;MIT&quot;</failure>
    </testcase>
  </testsuite>
  <testsuite name="Apache-2.0" tests="1" errors="0" failures="1">
    <testcase name="Apache-2.0">
      <failure type="License Compliance Error">1 package use non compliant license &quot;Apache-2.0&quot;</failure>
    </testcase>
  </testsuite>
</testsuites>`));
});
