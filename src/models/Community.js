const { DataTypes } = require("sequelize");

module.exports = (database) => {
  database.define(
    "Community",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      summary: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: false }
  );
};
