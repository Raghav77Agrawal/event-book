const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    dialect: "mysql",
    port:process.env.MYSQLPORT
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

module.exports = sequelize;