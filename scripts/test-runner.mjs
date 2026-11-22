import { createServer } from "node:net";
import { spawn } from "node:child_process";

const pnpm = "pnpm";
const docker = process.platform === "win32" ? "docker.exe" : "docker";
const containerName = `cap-4-verify-${process.pid}`;

const freePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.unref();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close((error) => (error ? reject(error) : resolve(port)));
  });
});

const run = (command, args, options = {}) => new Promise((resolve) => {
  const child = spawn(command, args, { ...options, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("error", (error) => resolve({ code: 1, output: `${output}\n${error.message}` }));
  child.on("exit", (code) => resolve({ code: code ?? 1, output }));
});

const escapeXml = (value) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]);
const results = [];
let port;

try {
  port = await freePort();
  const start = await run(docker, ["run", "--rm", "-d", "--name", containerName, "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "-p", `${port}:5432`, "postgres:16"]);
  if (start.code !== 0) throw new Error(start.output);

  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const check = await run(docker, ["exec", containerName, "pg_isready", "-U", "postgres"]);
    if (check.code === 0) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  if (!ready) throw new Error("scratch PostgreSQL did not become ready");

  const test = await run(pnpm, ["-r", "--parallel", "run", "test"], {
    env: { ...process.env, DATABASE_HOST: "127.0.0.1", DATABASE_PORT: String(port), DATABASE_USER: "postgres", DATABASE_PASSWORD: "" },
    shell: process.platform === "win32",
  });
  results.push({ name: "workspace tests", ...test });

  const smoke = await run("node", ["scripts/compose-smoke.mjs"], { env: process.env });
  results.push({ name: "same-origin compose smoke", ...smoke });
} catch (error) {
  results.push({ name: "test environment", code: 1, output: error instanceof Error ? error.message : String(error) });
} finally {
  await run(docker, ["rm", "-f", containerName]);
}

const failures = results.filter((result) => result.code !== 0);
const cases = results.map((result) => `  <testcase name="${result.name}">${result.code === 0 ? "" : `<failure message="failed">${escapeXml(result.output.slice(-4000))}</failure>`}</testcase>`).join("\n");
process.stdout.write(`<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="opengym" tests="${results.length}" failures="${failures.length}" errors="0">\n${cases}\n</testsuite>\n`);
process.exit(failures.length === 0 ? 0 : 1);
