const buildServer = require("./app");

const test = async () => {
  const app = buildServer();

  const response = await app.inject({
    method: "GET",
    url: "/",
  });

  console.log("status code: ", response.statusCode);
  console.log("body: ", response.body);
};

test();
