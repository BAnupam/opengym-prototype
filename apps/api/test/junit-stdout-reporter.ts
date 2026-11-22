/**
 * JUnit reporter that writes to stdout instead of a file.
 * IRIS captures stdout and parses it as JUnit XML.
 */
import type { Reporter as VitestReporter } from "vitest";

const junitReporter: VitestReporter = {
  onFinished(_providers, files) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    const totalTests = files.reduce((acc, f) => acc + f.tests.length, 0);
    const totalFailures = files.reduce(
      (acc, f) => acc + f.tests.filter((t) => t.state === "fail").length,
      0,
    );
    const totalTime = files.reduce((acc, f) => acc + (f.result?.duration ?? 0), 0);

    xml += `<testsuites name="vitest" tests="${totalTests}" failures="${totalFailures}" errors="0" time="${totalTime / 1000}">\n`;

    for (const file of files) {
      const passed = file.tests.filter((t) => t.state === "pass").length;
      const failed = file.tests.filter((t) => t.state === "fail").length;
      const skipped = file.tests.filter((t) => t.state === "skip").length;
      const duration = file.result?.duration ?? 0;
      const fileName = file.name.replace(/.*\/(\w+\.test\.\w+)$/, "$1") ?? file.name;

      xml += `  <testsuite name="${fileName}" tests="${file.tests.length}" errors="0" failures="${failed}" skipped="${skipped}" time="${duration / 1000}">\n`;

      for (const test of file.tests) {
        const testDuration = test.duration ?? 0;
        xml += `    <testcase name="${test.name}" classname="${fileName}" time="${testDuration / 1000}">\n`;

        if (test.state === "fail" && test.errors) {
          for (const err of test.errors) {
            const msg = err.message ?? "AssertionError";
            const stack = err.stack ?? "";
            // Escape XML special chars in message
            const safeMsg = msg
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");
            // Escape XML special chars in stack (keep newlines)
            const safeStack = stack
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            xml += `      <failure message="${safeMsg}">\n<![CDATA[\n${safeStack}\n]]>\n      </failure>\n`;
          }
        }

        if (test.state === "skip") {
          xml += `      <skipped/>\n`;
        }

        xml += `    </testcase>\n`;
      }

      xml += `  </testsuite>\n`;
    }

    xml += `</testsuites>`;

    // Write JUnit XML to stdout
    process.stdout.write(xml + "\n");
  },
};

export default junitReporter;