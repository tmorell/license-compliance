import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get unique contributors list from git log
const gitOutput = execSync("git log --format='%aN <%aE>' | sort -u", {
    encoding: "utf-8",
    env: {
        ...process.env,
        PATH: ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"].join(":"),
    },
});

// Filter out non-contributors
const contributors = gitOutput
    .split("\n")
    .map(line => line.trim())
    .filter(line => {
        if (!line) {
            return false;
        }
        const lower = line.toLowerCase();
        return !(lower.includes("teomorell") || lower.includes("renovate"));
    })
    .sort((a, b) => a.localeCompare(b));

// Read existing package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

// Update contributors
pkg.contributors = contributors;
await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 4), "utf-8");

// Run prettier on package.json to format properly
execSync(`npx prettier --write ${packageJsonPath}`);
console.log(`Updated package.json with ${contributors.length} contributors.`);
