#!/usr/bin/env node
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { env } from "node:process";
import { resolve, join, dirname } from "node:path";

// Parse command line args for --outputFile
const args = process.argv.slice(2);
const outputFileIndex = args.indexOf("--outputFile");
let outputFile = null;
if (outputFileIndex >= 0 && outputFileIndex + 1 < args.length) {
  outputFile = args[outputFileIndex + 1];
  // Expand $IRIS_TEST_REPORT_DIR if present
  if (outputFile.includes("$IRIS_TEST_REPORT_DIR")) {
    outputFile = outputFile.replace("$IRIS_TEST_REPORT_DIR", env.IRIS_TEST_REPORT_DIR);
  }
}

const reportDir = env.IRIS_TEST_REPORT_DIR;
if (reportDir) {
  mkdirSync(reportDir, { recursive: true });
  const output = outputFile || join(reportDir, "vitest-results.json");
  const cmd = `npx vitest run --reporter json --outputFile "${output}"`;
  console.error(`Running: ${cmd}`);
  console.error(`Report dir: ${reportDir}`);
  execSync(cmd, {
    stdio: "inherit",
    env,
  });
} else {
  // Fallback for manual runs
  execSync("npx vitest run --reporter json", {
    stdio: "inherit",
    env,
  });
}
