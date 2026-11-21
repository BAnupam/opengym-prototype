import Fastify from "fastify";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- boundary import: demonstrates workspace dependency resolution
import { ApiErrorEnvelopeSchema } from "@opengym/shared";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

export { app };
