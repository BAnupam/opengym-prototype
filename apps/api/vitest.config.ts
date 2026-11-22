import { defineConfig } from "vitest/config";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    globals: true,
    globalSetup: [resolve(__dirname, "test/setup.ts")],
    reporters: [
      "verbose",
      [
        "junit",
        {
          outputFile: resolve(
            process.env.IRIS_TEST_REPORT_DIR || resolve(__dirname, "junit-report"),
            "junit.xml",
          ),
        },
      ],
    ],
    coverage: {
      provider: "v8",
      include: ["src/modules/**"],
      reporter: ["text", "json", "json-summary", "lcov"],
      reportsDirectory: resolve(__dirname, "../../artifacts/coverage/api"),
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 80 },
    },
  },
});
