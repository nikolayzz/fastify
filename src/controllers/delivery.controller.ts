import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDeliveryZonesSchema } from "../schemas/getDeliveryZonesSchema";
import { createDeliveryZonesSchema } from "../schemas/createDeliveryZonesSchema";
import {getDeliveryZoneService} from '../services/getDeliveryZone.service'


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
    ) => getDeliveryZoneService(fastify, req, reply)
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
      
      console.log(`req.body: ${req.body}`)
      console.log(`coordinates: ${coordinates}`)
      
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
          const id = await client.query(
            `INSERT INTO delivery_zone (title, polygon) VALUES('${title}', 'POLYGON(${coords})') RETURNING id;`
          );


          for (let el of id ) {
            console.log(el)
          }

          // const { rows } = await client.query(
          //   `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE id = ${id};`
          // );

          // console.log(rows)

          // return id

          // const { rows } = await client.query(
          //   `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE title = '${title}'`
          // );

          // const result = rows.forEach((zone) => {
          //   const rings = zone.polygon.split("),(");
  
          //   const polygon = rings.reduce((acc, element) => {
          //     const coordinates = element.split(",");
          //     const res = coordinates.reduce((acc1, element1) => {
          //       acc1.push(JSON.parse("[" + element1.match(/\d+/g) + "]"));
          //       return acc1;
          //     }, []);
          //     acc.push(res);
          //     return acc;
          //   }, []);
  
          //   return {
          //     id: zone.id,
          //     title: zone.title,
          //     polygon: {
          //       type: "Polygon",
          //       coordinates: polygon,
          //     },
          //   };
          // });

          // reply.code(200).send(result)

          // console.log(`result: ${result}`)

          // const response = {
          //   id: rows[0].id,
          //   title: rows[0].title,
          //   polygon: {
          //     type: "Polygon",
          //     coordinates: rows[0].polygon,
          //   },
          // };

          // console.log(response);

          // return {
          //   response,
          // };
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
