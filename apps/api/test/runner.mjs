#!/usr/bin/env node
/**
 * Test runner that outputs JUnit XML to stdout for IRIS consumption.
 * IRIS records the harness with format=junit, source=stdout and parses the XML.
 */
import { createServer } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";
import { createVitest } from "vitest/node";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.test
const { loadEnv } = await import("vite");
const env = loadEnv("test", __dirname, "");

// Set env vars for the test setup script
process.env.DATABASE_HOST = env.DATABASE_HOST || "127.0.0.1";
process.env.DATABASE_PORT = env.DATABASE_PORT || "15432";
process.env.DATABASE_USER = env.DATABASE_USER || "postgres";
process.env.DATABASE_PASSWORD = env.DATABASE_PASSWORD || "cap2testpass";

const vitest = await createVitest("node", {
  root: __dirname,
  include: ["src/**/*.test.ts"],
  passWithNoTests: true,
  globals: true,
  globalSetup: [resolve(__dirname, "test/setup.ts")],
  reporters: ["verbose"],
});

await vitest.start();

// Collect results
const suites = vitest.state?.getReportedSuites() ?? [];
const tests = vitest.state?.getReportedTests() ?? [];

// Build JUnit XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<testsuites name="vitest" tests="${tests.length}" failures="${tests.filter(t => t.state === "fail").length}" errors="0" time="${(vitest.state?.duration ?? 0) / 1000}">\n`;

// Group by suite
const suiteMap = new Map();
for (const test of tests) {
  const suiteName = test.suite || "root";
  if (!suiteMap.has(suiteName)) {
    suiteMap.set(suiteName, { name: suiteName, tests: [], failures: 0 });
  }
  const suite = suiteMap.get(suiteName);
  suite.tests.push(test);
  if (test.state === "fail") suite.failures++;
}

for (const [, suite] of suiteMap) {
  const duration = suite.tests.reduce((acc, t) => acc + (t.duration ?? 0), 0);
  xml += `  <testsuite name="${suite.name}" tests="${suite.tests.length}" failures="${suite.failures}" errors="0" time="${duration / 1000}">\n`;
  for (const test of suite.tests) {
    xml += `    <testcase name="${test.name}" classname="${suite.name}" time="${(test.duration ?? 0) / 1000}">\n`;
    if (test.state === "fail" && test.error) {
      const msg = test.error.message ?? "Unknown error";
      const stack = test.error.stack ?? "";
      xml += `      <failure message="${msg}">\n${stack}\n      </failure>\n`;
    } else if (test.state === "skip" || test.state === "todo") {
      xml += `      <skipped/>\n`;
    }
    xml += `    </testcase>\n`;
  }
  xml += `  </testsuite>\n`;
}

xml += `</testsuites>`;

// Write JUnit XML to stdout (IRIS captures this)
process.stdout.write(xml + "\n");

// Exit with appropriate code
const hasFailures = tests.some(t => t.state === "fail");
process.exit(hasFailures ? 1 : 0);