import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { stringToArray } from "../helpers/stringToArray";

export const getDeliveryZoneServiceFromPost = async (
  fastify: FastifyInstance,
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

  console.log(`title: ${title}`);
  console.log(`polygon: ${polygon}`);
  console.log(`coordinates: ${coordinates}`);

  let coords = "";
  for (let i = 0; i < coordinates.length; i++) {
    coords += "(";
    for (let j = 0; j < coordinates[i].length; j++) {
      coords +=
        coordinates[i][j][0].toString() + " " + coordinates[i][j][1].toString();
      if (j !== coordinates[i].length - 1) {
        coords += ",";
      }
    }
    coords += ")";
    if (i !== coordinates.length - 1) {
      coords += ",";
    }
  }

  console.log(`coords: ${coords}`);

  try {
    const client = await fastify.pg.connect();

    // создаем новую зону и получаем её id
    const { rows: rowsId } = await client.query(
      `INSERT INTO delivery_zone (title, polygon) VALUES('${title}', 'POLYGON(${coords})') RETURNING id;`
    );

    // делаем запрос по id и получаем созданную зону
    const { rows: rowsReply } = await client.query(
      `SELECT id, title, st_astext(polygon) as polygon FROM delivery_zone WHERE id = ${rowsId[0].id};`
    );

    const result = stringToArray(rowsReply);

    if (req.validationError) {
      reply.code(400).send(req.validationError);
    }

    reply.code(200).send(result[0]);
  } catch (error: any) {
    let sendText =
      error.code == "23505"
        ? "Зона с таким title уже существует!"
        : "Запрос не прошел валидацию!";
    console.log(sendText);
    let statusCode = error.code == "23505" ? 422 : 400;
    reply.code(statusCode).send(sendText);
  } finally {
    await client.end();
  }
};
