import test from "ava";
import * as cosmiconfig from "cosmiconfig";
import * as sinon from "sinon";

import { getConfiguration } from "../../src/configuration";
import { Formatter, Report } from "../../src/enumerations";
import { Configuration } from "../../src/interfaces";
import * as program from "../../src/program";

declare type Config = unknown;

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

test.beforeEach((): void => {
    sinon.stub(process.stdout, "write");
    sinon.stub(process.stderr, "write");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("Default configuration", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    sinon.stub(program, "processArgs").returns(<Configuration>{});

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

test.serial("Invalid inline configuration", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve({
        config: {
            format: "some-format",
        },
        filepath: "some-path",
        isEmpty: false,
    }));

    // No command line args
    sinon.stub(program, "processArgs").returns(<Configuration>{});

    // Get configuration
    const config = await getConfiguration();

    t.is(config, null);
});

test.serial("Inline configuration, not extended", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve({
        config: {
            production: true,
            allow: ["MIT", "ISC"],
            format: Formatter.json.toLowerCase(),
        },
        filepath: "some-path",
        isEmpty: false,
    }));

    // No command line args
    sinon.stub(program, "processArgs").returns(<Configuration>{});

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

test.serial("Inline configuration, invalid extended file", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve({
        config: {
            allow: ["Apache-2.0"],
            report: Report.detailed.toLowerCase(),
            extends: "@acme/some-invalid-file",
        },
        filepath: "some-path",
        isEmpty: false,
    }));
    sinon.stub(explorer, "load").throws("ENOENT: no such file or directory");

    // Get configuration
    const config = await getConfiguration();

    t.is(config, null);
});

test.serial("Inline configuration, extended null", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve({
        config: {
            allow: ["Apache-2.0"],
            report: Report.detailed.toLowerCase(),
            extends: "@acme/license-policy",
        },
        filepath: "some-path",
        isEmpty: false,
    }));
    sinon.stub(explorer, "load").returns(Promise.resolve(null));

    // No command line args
    sinon.stub(program, "processArgs").returns(<Configuration>{});

    // Get configuration
    const config = await getConfiguration();

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "Apache-2.0");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.false(config?.production);
    t.is(config?.format, Formatter.text);
    t.is(config?.report, Report.detailed);
});

test.serial("Inline configuration, extended", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve({
        config: {
            allow: ["Apache-2.0"],
            report: Report.detailed.toLowerCase(),
            extends: "@acme/license-policy",
        },
        filepath: "some-path",
        isEmpty: false,
    }));
    sinon.stub(explorer, "load").returns(Promise.resolve({
        config: {
            allow: ["MIT", "ISC"],
            format: Formatter.json.toLowerCase(),
            production: true,
        },
        filepath: "some-path",
        isEmpty: false,
    }));

    // No command line args
    sinon.stub(program, "processArgs").returns(<Configuration>{ direct: true });

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

function createExplorer(): Explorer {
    return {
        search: (): Promise<CosmiconfigResult> => Promise.resolve(null),
        load: (): Promise<CosmiconfigResult> => Promise.resolve(null),
        clearLoadCache: (): void => {
            return;
        },
        clearSearchCache: (): void => {
            return;
        },
        clearCaches: (): void => {
            return;
        },
    };
}