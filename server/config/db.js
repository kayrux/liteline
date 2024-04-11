const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  HOST: "liteline-server-03.eastus.cloudapp.azure.com",
  USER: process.env.PSQL_USERNAME,
  PASSWORD: process.env.PSQL_PASSWORD,
  DB: "db_prod",
  PORT: 5432,
  dialect: "postgres",
  SSL: true,
};

// module.exports = {
//   HOST: "localhost",
//   USER: "postgres",
//   PASSWORD: "123",
//   DB: "liteline",
//   PORT: 5432,
//   dialect: "postgres",
//   SSL: true,
// };
