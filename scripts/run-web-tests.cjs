#!/usr/bin/env node
// Wrapper: runs vitest for @opengym/web.
// When IRIS_TEST_REPORT_DIR is set, vitest config writes the JUnit report directly there.
const { execSync } = require('child_process');
const path = require('path');

const webDir = path.resolve(__dirname, '..', 'apps', 'web');
execSync('pnpm exec vitest run --reporter verbose --reporter junit', {
  cwd: webDir,
  stdio: 'inherit',
  env: { ...process.env },
});
