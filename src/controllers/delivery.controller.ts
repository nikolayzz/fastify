import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDeliveryZonesSchema } from "../schemas/getDeliveryZonesSchema";
import { createDeliveryZonesSchema } from "../schemas/createDeliveryZonesSchema";

interface IDeliveryZoneFromDb {
  id: number;
  title: string;
  polygon: string;
}

const deliveryControllers = (fastify: FastifyInstance, options, done) => {
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
    ) => {
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
  );

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
    ) => {
      const { title, polygon } = req.body;
      const coordinates = polygon.coordinates;

      let coords = "";
      for (let i = 0; i < coordinates.length; i++) {
        coords += "(";
        for (let j = 0; j < coordinates[i].length; j++) {
          coords +=
            coordinates[i][j][0].toString() +
            " " +
            coordinates[i][j][1].toString();
          if (j !== coordinates[i].length - 1) {
            coords += ",";
          }
        }
        coords += ")";
        if (i !== coordinates.length - 1) {
          coords += ",";
        }
      }

      try {
        fastify.pg.transact(async (client) => {
          await client.query(
            `INSERT INTO delivery_zone (title, polygon) VALUES('${title}', 'POLYGON(${coords})')`
          );
          const { rows } = await client.query(
            `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE title = '${title}'`
          );

          const response = {
            id: rows[0].id,
            title: rows[0].title,
            polygon: {
              type: "Polygon",
              coordinates: rows[0].polygon,
            },
          };

          console.log(response);

          return {
            response,
          };
          // reply.code(200).send(response);
        });
      } catch (error) {
        console.log(error);
      }
    }
  );

  done();
};

export default deliveryControllers;
