import { app } from "./app.js";

const port = Number.parseInt(process.env.API_PORT ?? "3001", 10);

await app.listen({ host: "0.0.0.0", port });

const close = async () => {
  await app.close();
  process.exit(0);
};

process.once("SIGINT", close);
process.once("SIGTERM", close);
