import crypto from "node:crypto";
import fp from "fastify-plugin";

export default fp(async (app) => {
  app.addHook("onRequest", async (request, reply) => {
    const requestId = crypto.randomUUID();
    request.log = request.log.child({ request_id: requestId });
    reply.header("x-request-id", requestId);
  });
});
