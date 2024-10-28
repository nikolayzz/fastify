const fastify = require("fastify");
const fastifyEnv = require("@fastify/env");
const deliveryControllers = require("./controllers/delivery.controller");

function buildServer() {
  const app = fastify();

  app.get("/", async (req, reply) => {
    return {
      hello: "world",
    };
  });

  app.register(deliveryControllers, { prefix: "/delivery-zones" });

  const schema = {
    type: "object",
    required: ["DB_USERNAME", "DB_PASSWORD"],
    properties: {
      DB_USERNAME: { type: "string" },
      DB_PASSWORD: { type: "string" },
    },
  };
  const options = {
    confKey: "config",
    schema,
    dotenv: true,
    data: process.env,
  };

  const initializeDb = async () => {
    app.register(fastifyEnv, options);
    await app.after();

    const username = encodeURIComponent(app.config.DB_USERNAME);
    const password = encodeURIComponent(app.config.DB_PASSWORD);
    const dbName = "postgres";
    const url = `postgres://${username}:${password}@localhost/${dbName}`;

    app.register(require("@fastify/postgres"), {
      connectionString: url,
    });
  };

  initializeDb();

  return app;
}

module.exports = buildServer;
