const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rooms: {
        type: DataTypes.ARRAY(DataTypes.BIGINT),
        allowNull: true,
        defaultValue: [],
      },
    },
    { timestamps: false }
  );

  // Match user entered password to hashed password in database
  User.prototype.verifyPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Encrypt password using bcrypt
  const hashPassword = async (user) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  };

  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  return User;
};
