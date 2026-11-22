import { mkdir, readdir, writeFile } from "node:fs/promises";

const migrations = (await readdir("apps/api/src/db/migrations")).filter((file) => file.endsWith(".sql")).sort();
if (!migrations.length || migrations.some((file) => !/^\d{14}_.+\.sql$/.test(file))) {
  throw new Error("migrations must use timestamp-prefixed SQL filenames");
}
if (new Set(migrations).size !== migrations.length) throw new Error("migration names must be unique");
await mkdir("artifacts/migrations", { recursive: true });
await writeFile("artifacts/migrations/check.json", `${JSON.stringify({ migrations, status: "passed" }, null, 2)}\n`);
process.stdout.write(`validated ${migrations.length} migration files\n`);
