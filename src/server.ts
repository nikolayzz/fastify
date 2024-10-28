const server = require("./app")({ logger: true });

async function main() {
  try {
    const PORT = process.env.PORT || 8080;
    await server.ready();
    await server.listen({ port: PORT });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

main();
