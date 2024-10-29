import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDeliveryZonesSchema } from "../schemas/getDeliveryZonesSchema";
import { createDeliveryZonesSchema } from "../schemas/createDeliveryZonesSchema";
import { getDeliveryZoneServiceFromGet } from "../services/getDeliveryZoneServiceFromGet.service";
import { getDeliveryZoneServiceFromPost } from "../services/getDeliveryZoneServiceFromPost.service";

const deliveryControllers = (fastify: FastifyInstance, options, done) => {
  // Получаем из БД массив зон, совпадающих с заданными координатами
  fastify.get(
    "/",
    {
      schema: getDeliveryZonesSchema,
    },
    async (
      req: FastifyRequest<{
        Querystring: {
          longitude: number;
          latitude: number;
        };
      }>,
      reply: FastifyReply
    ) => getDeliveryZoneServiceFromGet(fastify, req, reply)
  );

  // создаем новую зону в БД
  fastify.post(
    "/",
    {
      schema: createDeliveryZonesSchema,
    },
    async (
      req: FastifyRequest<{
        Body: {
          title: string;
          polygon: {
            type: string;
            coordinates: [];
          };
        };
      }>,
      reply: FastifyReply
    ) => getDeliveryZoneServiceFromPost(fastify, req, reply)
  );

  done();
};

export default deliveryControllers;
