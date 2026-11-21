import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("Fastify server", () => {
  it("exports a Fastify instance", () => {
    expect(app).toBeDefined();
    expect(typeof app.ready).toBe("function");
  });

  it("responds to /health", async () => {
    await app.ready();
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
  });
});
