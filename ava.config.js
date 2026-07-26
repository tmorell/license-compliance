export default {
    extensions: {
        ts: "module",
    },
    failFast: true,
    files: ["!tests/util.ts"],
    nodeArguments: [
        "--import=data:text/javascript,import { register } from 'node:module'; import { pathToFileURL } from 'node:url'; register('ts-node/esm', pathToFileURL('./'));",
    ],
    tap: false,
    timeout: "10s",
    verbose: true,
};
