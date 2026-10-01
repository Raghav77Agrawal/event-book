const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Event = sequelize.define("Event", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
    defaultValue: "pending",
    allowNull: false,
  },
  price: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
  createdBy: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "events",
  timestamps: true,
});

module.exports = Event;
