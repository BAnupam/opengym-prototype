import fp from "fastify-plugin";
import { Pool } from "pg";

declare module "fastify" {
  interface FastifyInstance {
    checkConnection(): Promise<boolean>;
  }
}

export default fp(async (app) => {
  const databaseUrl = process.env.DATABASE_URL;
  const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5_000 }) : null;

  app.decorate("checkConnection", async (): Promise<boolean> => {
    if (!pool) return false;
    try {
      await pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  });

  app.addHook("onClose", async () => {
    await pool?.end();
  });
});
