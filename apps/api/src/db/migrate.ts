import { Client, ClientConfig } from "pg";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

/**
 * Represents a migration file and its parsed metadata.
 */
interface Migration {
  filename: string;
  sql: string;
}

/**
 * List all pending (not yet applied) migrations in order.
 */
async function listPendingMigrations(client: Client): Promise<Migration[]> {
  await client.query("CREATE TABLE IF NOT EXISTS __migrations (filename TEXT PRIMARY KEY)");

  const allMigrations: Migration[] = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((filename) => ({
      filename,
      sql: readFileSync(join(migrationsDir, filename), "utf-8"),
    }));

  const { rows } = await client.query("SELECT filename FROM __migrations ORDER BY filename");
  const applied = new Set(rows.map((r: { filename: string }) => r.filename));

  return allMigrations.filter((m) => !applied.has(m.filename));
}

/**
 * Apply all pending migrations in order.
 */
export async function applyMigrations(
  databaseUrl: string,
  options?: { client?: Client; closeClient?: boolean },
): Promise<string[]> {
  const ownClient = !options?.client;
  const client = options?.client || new Client({ connectionString: databaseUrl });

  if (ownClient) {
    await client.connect();
  }

  try {
    const pending = await listPendingMigrations(client);
    const applied: string[] = [];

    for (const migration of pending) {
      await client.query(migration.sql);
      await client.query("INSERT INTO __migrations (filename) VALUES ($1)", [migration.filename]);
      applied.push(migration.filename);
    }

    return applied;
  } finally {
    if (ownClient && options?.closeClient !== false) {
      await client.end();
    }
  }
}

/**
 * Check whether a specific migration has been applied.
 */
export async function isMigrationApplied(
  databaseUrl: string,
  filename: string,
): Promise<boolean> {
  const config: ClientConfig = { connectionString: databaseUrl, connectionTimeoutMillis: 5000 };
  const client = new Client(config);

  try {
    await client.connect();
    await client.query("CREATE TABLE IF NOT EXISTS __migrations (filename TEXT PRIMARY KEY)");
    const { rowCount } = await client.query("SELECT 1 FROM __migrations WHERE filename = $1", [
      filename,
    ]);
    return rowCount! > 0;
  } finally {
    await client.end();
  }
}
