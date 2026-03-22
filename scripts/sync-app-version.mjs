import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Read the version from a workspace package (changesets bumps these, not root)
const workspacePkg = JSON.parse(readFileSync(resolve(root, "packages/constants/package.json"), "utf-8"));
const version = workspacePkg.version;

// Sync root package.json version
const rootPkgPath = resolve(root, "package.json");
const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf-8"));
if (rootPkg.version !== version) {
  rootPkg.version = version;
  writeFileSync(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
  console.log(`Synced root package.json to ${version}`);
} else {
  console.log(`Root package.json already at ${version}`);
}

// Sync appConfig.version in constants package
const configPath = resolve(root, "packages/constants/src/app-config.ts");
const content = readFileSync(configPath, "utf-8");
const updated = content.replace(/version: ".*?"/, `version: "${version}"`);

if (content !== updated) {
  writeFileSync(configPath, updated);
  console.log(`Synced appConfig.version to ${version}`);
} else {
  console.log(`appConfig.version already at ${version}`);
}
