const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/db");

const sequelize = new Sequelize({
  database: dbConfig.DB,
  username: dbConfig.USER,
  password: dbConfig.PASSWORD,
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: dbConfig.SSL,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log(
      `${dbConfig.dialect} database connected >> ${dbConfig.HOST} >> ${dbConfig.DB}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//connecting to model
db.users = require("./userModel")(sequelize, DataTypes);
db.chatrooms = require("./roomModel")(sequelize, DataTypes);
db.messages = require("./messageModel")(sequelize, DataTypes);

//exporting the module
module.exports = db;
