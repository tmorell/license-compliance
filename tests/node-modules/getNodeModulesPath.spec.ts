import test from "ava";
import path from "path";
import * as sinon from "sinon";

import { getNodeModulesPath } from "../../src/node-modules";

const NODE_MODULES = "node_modules";

test.before((): void => {
    sinon.stub(process.stdout, "write");
    sinon.stub(process.stderr, "write");
});

test.after((): void => {
    sinon.restore();
});

test("Find at cwd", (t): void => {
    const nodeModulesPath = getNodeModulesPath();
    t.is(nodeModulesPath, path.join(process.cwd(), NODE_MODULES));
});

test("Find cwd down the tree", (t): void => {
    // 'node_modules' does not exist at 'array-license-01', found at cwd
    const searchPath = path.join(process.cwd(), "tests", "mock-packages", "array-license-01");
    const nodeModulesPath = getNodeModulesPath(searchPath);
    t.is(nodeModulesPath, path.join(process.cwd(), NODE_MODULES));
});

test("Find cwd up the tree", (t): void => {
    // 'node_modules' found at 'installation-full'
    const searchPath = path.join(process.cwd(), "tests", "mock-packages", "installation-full");
    const nodeModulesPath = getNodeModulesPath(searchPath);
    t.is(nodeModulesPath, path.join(searchPath, NODE_MODULES));
});

test("Not found", (t): void => {
    const searchPath = path.join(path.sep);
    const nodeModulesPath = getNodeModulesPath(searchPath);
    t.is(nodeModulesPath, null);
});
