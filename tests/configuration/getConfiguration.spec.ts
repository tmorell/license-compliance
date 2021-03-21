import test, { afterEach, beforeEach } from "ava";
import * as sinon from "sinon";
import * as cosmiconfig from "cosmiconfig";

import { Configuration } from "../../src/interfaces";
import { Formatter, Report } from "../../src/enumerations";
import { getConfiguration } from "../../src/configuration";
import * as program from "../../src/program";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type Config = any;

declare type CosmiconfigResult = {
    config: Config;
    filepath: string;
    isEmpty?: boolean;
} | null;

interface Explorer {
    readonly search: (searchFrom?: string | undefined) => Promise<CosmiconfigResult>;
    readonly load: (filepath: string) => Promise<CosmiconfigResult>;
    readonly clearLoadCache: () => void;
    readonly clearSearchCache: () => void;
    readonly clearCaches: () => void;
}

beforeEach(() => {
    sinon.stub(process.stdout, "write");
});

afterEach(() => {
    sinon.restore();
});

test.serial("Default configuration", async (t) => {
    // No inline configuration
    const explorer = {
        search: () => Promise.resolve(null)
    } as Explorer;
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    sinon.stub(program, "processArgs").returns({} as Configuration);

    // Get configuration
    const config = await getConfiguration();

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.false(config?.production);
    t.is(config?.format, Formatter.text);
    t.is(config?.report, Report.summary);
});

test.serial("Invalid inline configuration", async (t) => {
    // No inline configuration
    const explorer = {
        search: () => Promise.resolve({
            config: {
                format: "some-format"
            },
            filepath: "some-path",
            isEmpty: false,
        })
    } as Explorer;
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    sinon.stub(program, "processArgs").returns({} as Configuration);

    // Get configuration
    const config = await getConfiguration();

    t.is(config, null);
});

test.serial("Inline configuration, not extended", async (t) => {
    // No inline configuration
    const explorer = {
        search: () => Promise.resolve({
            config: {
                production: true,
                allow: ["MIT", "ISC"],
                format: Formatter.json.toLowerCase()
            },
            filepath: "some-path",
            isEmpty: false,
        })
    } as Explorer;
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    sinon.stub(program, "processArgs").returns({} as Configuration);

    // Get configuration
    const config = await getConfiguration();

    t.not(config, null);
    t.is(config?.allow.length, 2);
    t.is(config?.allow[0], "MIT");
    t.is(config?.allow[1], "ISC");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.true(config?.production);
    t.is(config?.format, Formatter.json);
    t.is(config?.report, Report.summary);
});

test.serial("Inline configuration, invalid extended file", async (t) => {
    // Inline configuration
    const explorer = {
        search: () => Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/some-invalid-file",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
        load: () => { throw new Error("ENOENT: no such file or directory") },
    } as unknown as Explorer;
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // Get configuration
    const config = await getConfiguration();

    t.is(config, null);
});

test.serial("Inline configuration, extended", async (t) => {
    // Inline configuration
    const explorer = {
        search: () => Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
        load: () => Promise.resolve({
            config: {
                allow: ["MIT", "ISC"],
                format: Formatter.json.toLowerCase(),
                production: true,
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    } as unknown as Explorer;
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    sinon.stub(program, "processArgs").returns({ direct: true } as Configuration);

    // Get configuration
    const config = await getConfiguration();

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "Apache-2.0");
    t.false(config?.development);
    t.true(config?.direct);
    t.is(config?.exclude.length, 0);
    t.true(config?.production);
    t.is(config?.format, Formatter.json);
    t.is(config?.report, Report.detailed);
});
