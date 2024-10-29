interface IDeliveryZoneFromDb {
  id: number;
  title: string;
  polygon: string;
}

export const stringToArray = (rows: Array<IDeliveryZoneFromDb>) =>
  rows.map((zone: IDeliveryZoneFromDb) => {
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
