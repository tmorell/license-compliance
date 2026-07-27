import test from "ava";
import cosmiconfig from "cosmiconfig";
import esmock from "esmock";
import sinon from "sinon";

import { Format, Report } from "../../src/enumerations.js";
import { Configuration } from "../../src/interfaces.js";

const NODE_MODULES = "node_modules";

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

let stubStderr: sinon.SinonStub;
test.beforeEach((): void => {
    sinon.stub(process.stdout, "write");
    stubStderr = sinon.stub(process.stderr, "write");
});

test.afterEach((): void => {
    sinon.restore();
});

test.serial("Command lined args failed", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                throw new Error("error");
            },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
});

test.serial("Default configuration", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.false(config?.production);
    t.is(config?.format, Format.text);
    t.is(config?.report, Report.summary);
});

test.serial("Invalid inline configuration", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                format: "some-format",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
});

test.serial("Inline configuration, not extended", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                production: true,
                allow: ["MIT", "ISC"],
                format: Format.json.toLowerCase(),
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 2);
    t.is(config?.allow[0], "MIT");
    t.is(config?.allow[1], "ISC");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.true(config?.production);
    t.is(config?.format, Format.json);
    t.is(config?.report, Report.summary);
});

test.serial("Inline configuration, invalid extended file", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/some-invalid-file",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").throws("ENOENT: no such file or directory");

    const { getConfiguration } = await esmock("../../src/configuration.js");

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
});

test.serial("Inline configuration, invalid license", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["invalid-license"],
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(Promise.resolve(null));

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("extended option allow value 'invalid-license' is invalid."));
});

test.serial("Inline configuration, extended null", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(Promise.resolve(null));

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "Apache-2.0");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.false(config?.production);
    t.is(config?.format, Format.text);
    t.is(config?.report, Report.detailed);
});

test.serial("Transversal execution", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "../@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
});

test.serial("Non-existing extend package", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(explorer, "load").throws(Object.assign(new Error("File not found"), { code: "ENOENT" }));
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // No command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{},
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);
    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("was not found"));
});

test.serial("Inline configuration, extended", async (t): Promise<void> => {
    // Inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                report: Report.detailed.toLowerCase(),
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: {
                allow: ["MIT", "ISC"],
                format: Format.json.toLowerCase(),
                production: true,
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ direct: true },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "Apache-2.0");
    t.false(config?.development);
    t.true(config?.direct);
    t.is(config?.exclude.length, 0);
    t.true(config?.production);
    t.is(config?.format, Format.json);
    t.is(config?.report, Report.detailed);
});

test.serial("args allow override query (.license-compliancerc.js)", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                query: ["MIT", "ISC"],
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ allow: ["0BSD"] },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.query.length, 0);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "0BSD");
});

test.serial("args query override allow (.license-compliancerc.js)", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["MIT", "ISC"],
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ query: ["0BSD"] },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.is(config?.query.length, 1);
    t.is(config?.query[0], "0BSD");
});

test.serial("args allow override query (extended)", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: { query: ["MIT", "ISC"] },
            filepath: "node_modules/@acme/license-policy/index.js",
        }),
    );

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ allow: ["0BSD"] },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.query.length, 0);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "0BSD");
});

test.serial("args query override allow (extended)", async (t): Promise<void> => {
    // No inline configuration
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "some-path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: { allow: ["MIT", "ISC"] },
            filepath: "node_modules/@acme/license-policy/index.js",
        }),
    );

    // Command line args
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ query: ["0BSD"] },
        },
    });

    // Get configuration
    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.is(config?.query.length, 1);
    t.is(config?.query[0], "0BSD");
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
