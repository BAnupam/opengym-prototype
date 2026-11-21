import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    reporters: ["verbose", "junit"],
    outputFile: {
      junit: process.env.IRIS_TEST_REPORT_DIR
        ? `${process.env.IRIS_TEST_REPORT_DIR.trim()}/vitest-results.xml`
        : "vitest-results.xml",
    },
  },
});
