import Fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import { Client, ClientConfig } from "pg";
import { FoundationValidationInputSchema } from "@opengym/shared";
import databasePlugin from "./plugins/database.js";
import errorsPlugin from "./plugins/errors.js";
import { registerRateLimit } from "./plugins/rate-limit.js";
import requestIdPlugin from "./plugins/request-id.js";
import securityHeadersPlugin from "./plugins/security-headers.js";

export async function checkDatabaseConnection(databaseUrl: string): Promise<boolean> {
  if (!databaseUrl) return false;

  const config: ClientConfig = { connectionString: databaseUrl, connectionTimeoutMillis: 5_000 };
  const client = new Client(config);
  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function createApp(
  options: { loggerInstance?: FastifyBaseLogger } = {},
): Promise<FastifyInstance> {
  const app = options.loggerInstance
    ? Fastify({ loggerInstance: options.loggerInstance })
    : Fastify({ logger: process.env.VITEST ? false : true });

  app.register(requestIdPlugin);
  app.register(securityHeadersPlugin);
  app.register(errorsPlugin);
  app.register(databasePlugin);
  await registerRateLimit(app);

  app.get("/api/v1/health", async (request) => {
    request.log.info({ msg: "health check requested" });
    return { status: "ok" };
  });

  app.post("/api/v1/test/validate", async (request) => {
    const validated = app.validateInput(FoundationValidationInputSchema, request.body);
    return { validated };
  });

  app.get("/api/v1/ready", async (_request, reply) => {
    if (!(await app.checkConnection())) {
      return reply.status(503).send({
        error: { code: "DATABASE_UNAVAILABLE", message: "PostgreSQL is not reachable" },
      });
    }
    return { status: "ok" };
  });

  return app;
}

export const app = await createApp();
