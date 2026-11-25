#!/usr/bin/env node
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = readdirSync(join(root, "tests")).filter((f) => f.endsWith(".test.ts")).map((f) => join("tests", f));
const r = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--test", ...files],
  { stdio: "inherit", cwd: root }
);
process.exit(r.status ?? 1);
