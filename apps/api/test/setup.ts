import { Client } from "pg";

const HOST = process.env.DATABASE_HOST || "127.0.0.1";
const PORT = parseInt(process.env.DATABASE_PORT || "15432", 10);
const USER = process.env.DATABASE_USER || "postgres";
const PASSWORD = process.env.DATABASE_PASSWORD || "cap2testpass";

/**
 * Create the test database if it doesn't exist, then export the full DATABASE_URL.
 * Each test run gets a unique database name based on process start time so that
 * concurrent worktrees never share state.
 */
export async function setup(): Promise<void> {
  const dbName = process.env.OPENGYM_TEST_DATABASE ?? `opengym_test_${process.pid}`;

  // Connect to postgres to create the test database
  const adminClient = new Client({
    host: HOST,
    port: PORT,
    database: "postgres",
    user: USER,
    password: PASSWORD,
    connectionTimeoutMillis: 5000,
  });

  await adminClient.connect();

  try {
    const { rows } = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (rows.length === 0) {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
    }
  } finally {
    await adminClient.end();
  }

  // Set DATABASE_URL so that all tests use the unique test database
  process.env.DATABASE_URL = `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${dbName}`;
}

export async function teardown(): Promise<void> {
  // Clean up: drop the test database
  const dbName = process.env.OPENGYM_TEST_DATABASE ?? `opengym_test_${process.pid}`;

  const adminClient = new Client({
    host: HOST,
    port: PORT,
    database: "postgres",
    user: USER,
    password: PASSWORD,
    connectionTimeoutMillis: 5000,
  });

  await adminClient.connect();

  try {
    await adminClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
  } finally {
    await adminClient.end();
  }
}
