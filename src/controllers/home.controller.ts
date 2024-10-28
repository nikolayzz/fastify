import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const homeController = (fastify: FastifyInstance, options, done) => {
    fastify.get("/", async (req:FastifyRequest, reply: FastifyReply) => {
        return {
          hello: "world",
        };
      });

    done();
}

export default homeController;