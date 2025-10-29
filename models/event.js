const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  status:{type:DataTypes.ENUM("pending","approved","rejected"),defaultValue:"pending"},
  price: { type: DataTypes.FLOAT, allowNull: false }, 
  createdBy:{type:DataTypes.STRING}
}, {
  tableName:"events",
  timestamps: true,
});


module.exports = Event;
