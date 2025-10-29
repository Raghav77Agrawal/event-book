const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticketType: {
    type: DataTypes.STRING,
    defaultValue: "regular",
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  eventid:{
    type:DataTypes.STRING,
    allowNull:false,
  },
  email:{
    type:DataTypes.STRING,
    allowNull:false,
  }
}, {
  timestamps: true,
});

module.exports = Ticket;
