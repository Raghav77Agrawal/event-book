const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Ticket = sequelize.define("Ticket", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticketType: {
    type: DataTypes.ENUM("cancelled", "booked"),
    defaultValue: "cancelled",
    allowNull: false,
  },
  price: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
  eventid: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "tickets",
  timestamps: true,
});

module.exports = Ticket;
