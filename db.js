const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  "eventdb",
  "newuser",
  "R1234aghav.",
  {
    host: "localhost",
    dialect: "mysql"
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

module.exports = sequelize;