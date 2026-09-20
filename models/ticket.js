const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Ticket = sequelize.define("Ticket", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ticketType: {
    type: DataTypes.ENUM("pending", "booked", "failed", "cancelled"),
    defaultValue: "pending",
    allowNull: false,
  },
  price: { type: DataTypes.FLOAT, allowNull: false, validate: { min: 0 } },
  eventid: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "tickets",
  timestamps: true,
});

module.exports = Ticket;
