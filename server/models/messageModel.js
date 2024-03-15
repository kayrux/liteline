module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      room: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      sender: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
      },
      sendername: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  return Message;
};
