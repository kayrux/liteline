module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    "chatroom",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      owner: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      members: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true,
        defaultValue: [],
      },
    },
    { timestamps: false }
  );

  return Room;
};
