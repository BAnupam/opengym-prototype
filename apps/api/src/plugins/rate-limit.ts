import rateLimit from "@fastify/rate-limit";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

const options = {
  max: 300,
  timeWindow: "1 minute",
  keyGenerator: (request: { ip: string }) => request.ip,
  errorResponseBuilder: (_request: unknown, context: { statusCode: number }) => {
          const error = new Error("Too many requests, please try again later") as Error & {
            code: string;
            statusCode: number;
          };
          error.code = "RATE_LIMIT_EXCEEDED";
          error.statusCode = context.statusCode;
          return error;
        },
};

/** Install @fastify/rate-limit before API routes are declared. */
export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, options);
}

// Kept as a Fastify plugin for consumers that register cross-cutting concerns
// through plugin composition.
export default fp(registerRateLimit);
