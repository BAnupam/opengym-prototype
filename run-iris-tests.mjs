import { createServer } from "node:net";
import { execFileSync } from "node:child_process";

const docker = (args, options = {}) =>
  execFileSync("docker", args, { stdio: "inherit", timeout: 20_000, ...options });
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not allocate a test PostgreSQL port"));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });

const waitForDatabase = async (container) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      execFileSync("docker", ["exec", container, "pg_isready", "-U", "postgres"], {
        stdio: "ignore",
        timeout: 5_000,
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error("Test PostgreSQL did not become ready within 30 seconds");
};

const port = await freePort();
const suffix = `${process.pid}-${Math.random().toString(16).slice(2)}`;
const container = `opengym-cap2-test-${suffix}`;
const password = process.env.DATABASE_PASSWORD || "opengym_test";

try {
  docker(["info"], { stdio: "ignore" });
  docker([
    "run", "--rm", "-d", "--name", container,
    "-e", `POSTGRES_PASSWORD=${password}`,
    "-p", `${port}:5432`,
    "postgres:16",
  ]);
  await waitForDatabase(container);

  const environment = {
    ...process.env,
    DATABASE_HOST: process.env.DATABASE_HOST || "127.0.0.1",
    DATABASE_PORT: String(port),
    DATABASE_USER: process.env.DATABASE_USER || "postgres",
    DATABASE_PASSWORD: password,
    OPENGYM_TEST_DATABASE: `opengym_test_${suffix.replace(/[^a-zA-Z0-9_]/g, "_")}`,
  };
  execFileSync(pnpm, ["--filter", "@opengym/api", "test"], {
    stdio: "inherit",
    env: environment,
    shell: process.platform === "win32",
  });
} finally {
  try {
    docker(["rm", "-f", container], { stdio: "ignore" });
  } catch {
    // The container may not have started; no service is left running.
  }
}
