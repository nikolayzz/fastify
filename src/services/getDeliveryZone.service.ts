import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface IDeliveryZoneFromDb {
    id: number;
    title: string;
    polygon: string;
  }

export const getDeliveryZoneService =  async (fastify:FastifyInstance, req: FastifyRequest, reply: FastifyReply) => {
    const { longitude, latitude } = req.query;

      try {
        const client = await fastify.pg.connect();
        const { rows } = await client.query(
          `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE ST_Intersects('POINT(${longitude} ${latitude})'::geometry, delivery_zone.polygon);`
        );

        const result = rows.map((zone: IDeliveryZoneFromDb) => {
          const rings = zone.polygon.split("),(");

          const polygon = rings.reduce((acc, element) => {
            const coordinates = element.split(",");
            const res = coordinates.reduce((acc1, element1) => {
              acc1.push(JSON.parse("[" + element1.match(/\d+/g) + "]"));
              return acc1;
            }, []);
            acc.push(res);
            return acc;
          }, []);

          return {
            id: zone.id,
            title: zone.title,
            polygon: {
              type: "Polygon",
              coordinates: polygon,
            },
          };
        });

        reply.code(200).send(result);
      } catch (error) {
        console.log(error);
      }
}