import fp from "fastify-plugin";
import { ZodError, ZodType } from "zod";

declare module "fastify" {
  interface FastifyInstance {
    validateInput<T>(schema: ZodType<T>, input: unknown): T;
  }
}

export default fp(async (app) => {
  app.decorate("validateInput", <T>(schema: ZodType<T>, input: unknown): T => {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      const fields: Record<string, string[]> = {};
      for (const issue of error.issues) {
        const path = issue.path.join(".") || "root";
        fields[path] = [...(fields[path] ?? []), issue.message];
      }
      return reply.status(400).send({
        error: {
          code: "VALIDATION_FAILED",
          message: "Request validation failed",
          fields,
        },
      });
    }
    if (error.code === "RATE_LIMIT_EXCEEDED") {
      return reply.status(error.statusCode ?? 429).send({
        error: { code: "RATE_LIMIT_EXCEEDED", message: error.message },
      });
    }
    return reply.send(error);
  });
});
