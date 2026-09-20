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
  // Nullable temporarily so existing local tickets remain readable while the
  // additive schema update is applied. New tickets always receive userId.
  userId: { type: DataTypes.INTEGER, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: "tickets",
  timestamps: true,
});

module.exports = Ticket;
