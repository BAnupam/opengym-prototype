import { defineConfig } from "vitest/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    reporters: ["json", "verbose"],
    outputFile: {
      json: "vitest-results.json",
    },
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reporter: ["text", "json", "json-summary", "lcov"],
      reportsDirectory: resolve(__dirname, "../../artifacts/coverage/shared"),
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
