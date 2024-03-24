const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  HOST: "40.87.84.130",
  USER: process.env.PSQL_USERNAME,
  PASSWORD: process.env.PSQL_PASSWORD,
  DB: "chatroom_prod",
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
