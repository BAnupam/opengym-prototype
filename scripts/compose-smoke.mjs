import { createServer } from "node:net";
import { spawn } from "node:child_process";

const reservePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.unref();
  server.on("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    server.close((error) => (error ? reject(error) : resolve(port)));
  });
});

const docker = process.platform === "win32" ? "docker.exe" : "docker";

const runCompose = (args, env) => new Promise((resolve, reject) => {
  const child = spawn(docker, ["compose", ...args], { env, stdio: "inherit" });
  child.on("error", reject);
  child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`docker compose ${args.join(" ")} exited ${code}`))));
});

const webPort = String(await reservePort());
const projectName = `opengym-smoke-${process.pid}`;
const env = { ...process.env, WEB_PORT: webPort, COMPOSE_PROJECT_NAME: projectName };

try {
  await runCompose(["up", "--build", "-d"], env);
  const deadline = Date.now() + 120_000;
  let response;
  while (Date.now() < deadline) {
    try {
      response = await fetch(`http://127.0.0.1:${webPort}/api/v1/health`);
      if (response.ok) break;
    } catch {
      // The containers are still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  if (!response?.ok) throw new Error("same-origin /api/v1/health did not return 200");
  const body = await response.json();
  if (body.status !== "ok") throw new Error("health response did not contain status ok");
} finally {
  await runCompose(["down", "--volumes", "--remove-orphans"], env).catch(() => undefined);
}
