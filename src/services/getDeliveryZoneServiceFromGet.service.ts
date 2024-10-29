import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stringToArray } from "../helpers/stringToArray";

export const getDeliveryZoneServiceFromGet = async (
  fastify: FastifyInstance,
  req: FastifyRequest<{
    Querystring: {
      longitude: number;
      latitude: number;
    };
  }>,
  reply: FastifyReply
) => {
  const { longitude, latitude } = req.query;

  try {
    const client = await fastify.pg.connect();
    const { rows } = await client.query(
      `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE ST_Intersects('POINT(${longitude} ${latitude})'::geometry, delivery_zone.polygon);`
    );

    const result = stringToArray(rows);

    reply.code(200).send(result);
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
};
