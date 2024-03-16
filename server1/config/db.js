const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  HOST: "chatroom-db.postgres.database.azure.com",
  USER: process.env.PSQL_USERNAME,
  PASSWORD: process.env.PSQL_PASSWORD,
  DB: "chatroom_prod",
  PORT: 5432,
  dialect: "postgres",
  SSL: true,
};
