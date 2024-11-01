export const getDeliveryZonesSchema = {
  querystring: {
    additionalProperties: false,
    type: "object",
    properties: {
      longitude: {
        minimum: -180,
        maximum: 180,
        description: "Долгота",
        type: "number",
      },
      latitude: {
        minimum: -90,
        maximum: 90,
        description: "Широта",
        type: "number",
      },
    },
    required: ["longitude", "latitude"],
  },

  response: {
    200: {
      additionalProperties: false,
      type: "array",
      items: {
        additionalProperties: false,
        type: "object",
        properties: {
          id: {
            type: "integer",
          },
          title: {
            minLength: 1,
            maxLength: 30,
            type: "string",
          },
          polygon: {
            additionalProperties: false,
            description: "Полигон зоны доставки в формате GeoJSON",
            type: "object",
            properties: {
              type: {
                const: "Polygon",
                type: "string",
              },
              coordinates: {
                minItems: 1,
                maxItems: 3,
                description:
                  "Массив колец полигона. Первое кольцо в массиве - внешнее кольцо. Остальные кольца - внутренние кольца",
                type: "array",
                items: {
                  minItems: 3,
                  maxItems: 150,
                  description: "Кольцо полигона, состоит из координат",
                  type: "array",
                  items: {
                    minItems: 2,
                    maxItems: 2,
                    description:
                      "Координата. Первое значение в массиве - долгота, второе - широта",
                    type: "array",
                    items: {
                      type: "number",
                    },
                  },
                },
              },
            },
            required: ["type", "coordinates"],
          },
        },
        required: ["id", "title", "polygon"],
      },
    },
  },
};
