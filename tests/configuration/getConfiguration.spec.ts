import test, { ExecutionContext } from "ava";
import cosmiconfig from "cosmiconfig";
import esmock from "esmock";
import sinon from "sinon";

import { getConfiguration as getConfigurationFunc } from "../../src/configuration.js";
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

test.afterEach.always((): void => {
    sinon.restore();
});

// Default config, no args, no inline, no extended

test.serial("Default configuration", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(Promise.resolve(null));

    const config = await getConfigurationFunc(NODE_MODULES);

    assertDefaultConfig(t, config);
});

// Command line args

test.serial("Command args invalid input", async (t): Promise<void> => {
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                throw new Error("error");
            },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.is(config, null);
});

test.serial("Command args success", async (t): Promise<void> => {
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                return {
                    allow: ["MIT"],
                    development: false,
                    direct: true,
                    exclude: [/@acme/],
                    format: Format.json,
                    production: true,
                    query: [],
                    report: Report.detailed,
                    showConfig: true,
                };
            },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config.allow.length, 1);
    t.is(config.allow[0], "MIT");
    t.false(config.development);
    t.true(config.direct);
    t.is(config.exclude.length, 1);
    t.is(config.format, Format.json);
    t.true(config.production);
    t.is(config.query.length, 0);
    t.is(config.report, Report.detailed);
    t.is(config.showConfig, true);
});

// Inline only

test.serial("Inline invalid enumeration value", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                format: "invalid-format",
            },
            filepath: "path",
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(
        stubStderr.calledWithMatch(
            "extended option 'format' value 'invalid-format' is invalid. Allowed choices are csv, json, text, xunit.",
        ),
    );
});

test.serial("Inline invalid allow license", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["invalid-license"],
            },
            filepath: "path",
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("extended option allow value 'invalid-license' is invalid."));
});

test.serial("Inline invalid query license", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                query: ["invalid-license"],
            },
            filepath: "path",
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("extended option query value 'invalid-license' is invalid."));
});

test.serial("Inline success", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                production: true,
                allow: ["MIT", "ISC"],
                format: Format.json,
                report: Report.detailed,
            },
            filepath: "path",
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 2);
    t.is(config?.allow[0], "MIT");
    t.is(config?.allow[1], "ISC");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.true(config?.production);
    t.is(config?.format, Format.json);
    t.is(config?.report, Report.detailed);
});

// Extended

test.serial("Extended unknown loading error", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/non-existent-file",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").throws(Object.assign(new Error("Unknown error"), { code: "a-code" }));

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("Could not load the extended configuration module"));
});

test.serial("Extended non-existent file", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/non-existent-file",
            },
            filepath: "path",
        }),
    );
    sinon
        .stub(explorer, "load")
        .throws(Object.assign(new Error("ENOENT: no such file or directory"), { code: "ENOENT" }));

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("was not found"));
});

test.serial("Extended transversal execution", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "../@acme/license-policy",
            },
            filepath: "path",
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.is(config, null);
    t.true(stubStderr.calledOnce);
    t.true(stubStderr.calledWithMatch("resolves outside of node_modules"));
});

test.serial("Extended null package", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").returns(Promise.resolve(null));

    const config = await getConfigurationFunc(NODE_MODULES);

    assertDefaultConfig(t, config);
});

test.serial("Extended success", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: {
                allow: ["MIT", "ISC"],
                format: Format.json,
                production: true,
            },
            filepath: "path",
            isEmpty: false,
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 2);
    t.is(config?.allow[0], "MIT");
    t.is(config?.allow[1], "ISC");
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.is(config?.format, Format.json);
    t.true(config?.production);
    t.is(config?.query.length, 0);
    t.is(config?.report, Report.summary);
});

// Overwrite allow / query

test.serial("Overwrite allow -> query (inline)", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                query: ["MIT", "ISC"],
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ allow: ["Apache-2.0", "0BSD"] },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.query.length, 0);
    t.is(config?.allow.length, 2);
    t.is(config?.allow[0], "Apache-2.0");
    t.is(config?.allow[1], "0BSD");
});

test.serial("Overwrite query -> allow (inline)", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["MIT", "ISC"],
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ query: ["Apache-2.0", "0BSD"] },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.is(config?.query.length, 2);
    t.is(config?.query[0], "Apache-2.0");
    t.is(config?.query[1], "0BSD");
});

test.serial("Overwrite allow -> query (extended)", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: { query: ["MIT", "ISC"] },
            filepath: "node_modules/@acme/license-policy/index.js",
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ allow: ["0BSD"] },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.query.length, 0);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "0BSD");
});

test.serial("Overwrite query -> allow (extended)", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: { allow: ["MIT", "ISC"] },
            filepath: "node_modules/@acme/license-policy/index.js",
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => <Configuration>{ query: ["0BSD"] },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.is(config?.query.length, 1);
    t.is(config?.query[0], "0BSD");
});

// Hierarchy overwrite

test.serial("Hierarchy overwrite extended <- inline", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["MIT"],
                extends: "@acme/license-policy",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: {
                allow: ["ISC"],
            },
            filepath: "path",
            isEmpty: false,
        }),
    );

    const config = await getConfigurationFunc(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "MIT");
});

test.serial("Hierarchy overwrite extended <- args", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                extends: "@acme/license-policy",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: {
                allow: ["ISC"],
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                return { ...getDefaultConfig(), ...{ allow: ["MIT"] } };
            },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "MIT");
});

test.serial("Hierarchy overwrite inline <- args", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["0BSD", "ISC"],
            },
            filepath: "path",
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                return { ...getDefaultConfig(), ...{ allow: ["MIT"] } };
            },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "MIT");
});

test.serial("Hierarchy overwrite extended <- inline <- args", async (t): Promise<void> => {
    const explorer: Explorer = createExplorer();
    sinon.stub(cosmiconfig, "cosmiconfig").returns(explorer);
    sinon.stub(explorer, "search").returns(
        Promise.resolve({
            config: {
                allow: ["Apache-2.0"],
                extends: "@acme/license-policy",
            },
            filepath: "path",
        }),
    );
    sinon.stub(explorer, "load").returns(
        Promise.resolve({
            config: {
                allow: ["ISC"],
            },
            filepath: "path",
            isEmpty: false,
        }),
    );
    const { getConfiguration } = await esmock("../../src/configuration.js", {
        "../../src/program.js": {
            processArgs: (): Configuration => {
                return { ...getDefaultConfig(), ...{ allow: ["MIT"] } };
            },
        },
    });

    const config = await getConfiguration(NODE_MODULES);

    t.not(config, null);
    t.is(config?.allow.length, 1);
    t.is(config?.allow[0], "MIT");
});

// Utils

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

function assertDefaultConfig(t: ExecutionContext<unknown>, config: Configuration | null): void {
    t.not(config, null);
    t.is(config?.allow.length, 0);
    t.false(config?.development);
    t.false(config?.direct);
    t.is(config?.exclude.length, 0);
    t.is(config?.format, Format.text);
    t.false(config?.production);
    t.is(config?.query.length, 0);
    t.is(config?.report, Report.summary);
    t.is(config?.showConfig, false);
}

function getDefaultConfig(): Configuration {
    return {
        allow: [],
        development: false,
        direct: false,
        exclude: [],
        format: Format.text,
        production: false,
        query: [],
        report: Report.summary,
        showConfig: false,
    };
}
