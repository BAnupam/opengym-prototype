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
  },
});
