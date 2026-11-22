import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createApp, checkDatabaseConnection } from "./app";
import { applyMigrations } from "./db/migrate";
import { Client } from "pg";
import { FastifyInstance } from "fastify";
import pino from "pino";
import { Writable } from "node:stream";

const databaseUrl = process.env.DATABASE_URL;

// ---------------------------------------------------------------------------
// Non-database tests — use a fresh app per suite (no DATABASE_URL needed)
// ---------------------------------------------------------------------------
describe("Fastify server", () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await createApp();
    // Must call ready() so all plugins/hooks are registered before inject()
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  it("exports a Fastify instance", () => {
    expect(server).toBeDefined();
    expect(typeof server.ready).toBe("function");
  });

  describe("GET /api/v1/health", () => {
    it("returns 200 with status ok", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ok");
    });

    it("includes x-request-id header", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      const requestId = response.headers["x-request-id"];
      expect(requestId).toBeDefined();
      expect(typeof requestId).toBe("string");
      expect((requestId as string).length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/ready without database", () => {
    it("returns 503 when DATABASE_URL is not set", async () => {
      const saved = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;

      try {
        const noDbServer = await createApp();
        await noDbServer.ready();
        const response = await noDbServer.inject({
          method: "GET",
          url: "/api/v1/ready",
        });

        expect(response.statusCode).toBe(503);
        const body = JSON.parse(response.body);
        expect(body.error.code).toBe("DATABASE_UNAVAILABLE");

        await noDbServer.close();
      } finally {
        if (saved) process.env.DATABASE_URL = saved;
      }
    });
  });

  describe("Security headers", () => {
    it("includes X-Content-Type-Options: nosniff", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("includes Content-Security-Policy", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      expect(response.headers["content-security-policy"]).toBeDefined();
      expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
    });
  });

  describe("Rate limiting", () => {
    it("returns 429 on 301st request within one minute", async () => {
      const rateServer = await createApp();
      await rateServer.ready();

      for (let i = 0; i < 300; i++) {
        const response = await rateServer.inject({
          method: "GET",
          url: "/api/v1/health",
          remoteAddress: "127.0.0.1",
        });
        expect(response.statusCode).toBe(200);
      }

      const response = await rateServer.inject({
        method: "GET",
        url: "/api/v1/health",
        remoteAddress: "127.0.0.1",
      });
      expect(response.statusCode).toBe(429);

      await rateServer.close();
    });
  });

  describe("Request/log correlation", () => {
    it("response x-request-id is a valid UUID", async () => {
      const corrServer = await createApp();
      await corrServer.ready();

      const response = await corrServer.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      const responseRequestId = response.headers["x-request-id"] as string;
      expect(responseRequestId).toBeDefined();
      expect(typeof responseRequestId).toBe("string");
      expect(responseRequestId.length).toBeGreaterThan(0);
      expect(responseRequestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );

      await corrServer.close();
    });

    it("pino log contains the response request_id", async () => {
      const lines: string[] = [];
      const destination = new Writable({
        write(chunk, _encoding, callback) {
          lines.push(chunk.toString());
          callback();
        },
      });
      const logServer = await createApp({ loggerInstance: pino({ level: "info" }, destination) });
      await logServer.ready();
      const response = await logServer.inject({
        method: "GET",
        url: "/api/v1/health",
      });

      const responseRequestId = response.headers["x-request-id"] as string;
      expect(responseRequestId).toBeDefined();

      const records = lines.flatMap((line) => line.trim().split("\n")).map((line) => JSON.parse(line));
      expect(records.some((record) => record.request_id === responseRequestId)).toBe(true);

      await logServer.close();
    });
  });

  describe("Input validation", () => {
    it("returns 400 with VALIDATION_FAILED for invalid input", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/v1/test/validate",
        body: {
          email: "not-an-email",
          displayName: "",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe("VALIDATION_FAILED");
      expect(body.error.fields).toBeDefined();
      expect(Object.keys(body.error.fields).length).toBeGreaterThan(0);
    });

    it("returns 200 for valid input", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/api/v1/test/validate",
        body: {
          email: "user@example.com",
          displayName: "Test User",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.validated.email).toBe("user@example.com");
      expect(body.validated.displayName).toBe("Test User");
    });
  });
});

// ---------------------------------------------------------------------------
// Database integration tests — require DATABASE_URL
// ---------------------------------------------------------------------------
describe("Database integration", () => {
  if (!databaseUrl) {
    it("skipped — DATABASE_URL not set", () => {
      // No real database available.
    });
    return;
  }

  describe("GET /api/v1/ready with database", () => {
    it("returns 200 when PostgreSQL is reachable", async () => {
      const server = await createApp();
      await server.ready();
      const response = await server.inject({
        method: "GET",
        url: "/api/v1/ready",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ok");

      await server.close();
    });
  });

  describe("checkDatabaseConnection", () => {
    it("returns true when PostgreSQL is reachable", async () => {
      const connected = await checkDatabaseConnection(databaseUrl!);
      expect(connected).toBe(true);
    });

    it("returns false for invalid connection", async () => {
      // Invalid host should fail quickly with a connection timeout
      const connected = await checkDatabaseConnection("postgresql://invalid:59999/nowhere");
      expect(connected).toBe(false);
    }, 10000);
  });

  describe("Migration", () => {
    let client: Client;

    beforeEach(async () => {
      client = new Client({ connectionString: databaseUrl! });
      await client.connect();
    });

    afterEach(async () => {
      await client.end();
    });

    it("applies the initial users migration and creates the table", async () => {
      // Drop tables for clean test state
      await client.query("DROP TABLE IF EXISTS users");
      await client.query("DROP TABLE IF EXISTS __migrations");

      const applied = await applyMigrations(databaseUrl!, { client, closeClient: false });
      expect(applied).toContain("20261121000000_create_users.sql");

      // Verify the table exists
      const { rows } = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_name = 'users'",
      );
      expect(rows.length).toBe(1);
      expect(rows[0].table_name).toBe("users");
    });

    it("users table has correct columns", async () => {
      await client.query("DROP TABLE IF EXISTS users");
      await client.query("DROP TABLE IF EXISTS __migrations");
      await applyMigrations(databaseUrl!, { client, closeClient: false });

      const { rows } = await client.query(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position",
      );

      expect(rows.length).toBe(6);
      expect(rows[0].column_name).toBe("id");
      expect(rows[1].column_name).toBe("email");
      expect(rows[2].column_name).toBe("display_name");
      expect(rows[3].column_name).toBe("time_zone");
      expect(rows[4].column_name).toBe("created_at");
      expect(rows[5].column_name).toBe("is_demo");
      expect(rows[5].column_default).toContain("false");
    });

    it("is_demo defaults to false", async () => {
      await client.query("DROP TABLE IF EXISTS users");
      await client.query("DROP TABLE IF EXISTS __migrations");
      await applyMigrations(databaseUrl!, { client, closeClient: false });

      const testEmail = `test-cap2-${Date.now()}@test.com`;
      await client.query(
        `INSERT INTO users (email, display_name, time_zone) VALUES ($1, 'Test User', 'UTC')`,
        [testEmail],
      );

      const { rows } = await client.query("SELECT is_demo FROM users WHERE email = $1", [
        testEmail,
      ]);
      expect(rows[0].is_demo).toBe(false);

      // Clean up exactly what test created
      await client.query("DELETE FROM users WHERE email = $1", [testEmail]);
    });
  });
});
