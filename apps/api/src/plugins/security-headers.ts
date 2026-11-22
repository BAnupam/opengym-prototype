import fp from "fastify-plugin";

export default fp(async (app) => {
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header(
      "Content-Security-Policy",
      "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    );

    if (process.env.APP_ENV === "sit") {
      reply.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return payload;
  });
});
