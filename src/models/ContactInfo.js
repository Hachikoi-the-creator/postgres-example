const { DataTypes } = require("sequelize");

module.exports = (database) => {
  database.define(
    "ContactInfo",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      phone: { type: DataTypes.STRING, allowNull: false },
    },
    { timestamps: false }
  );
};
