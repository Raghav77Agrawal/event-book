const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("User", {
   id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  firebaseuid:{type: DataTypes.STRING,unique:true},
  role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
},{
  tableName:"users",
  timestamps:true
});

module.exports = User;