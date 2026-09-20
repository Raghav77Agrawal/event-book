const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: process.env.NODE_ENV === "production" ? {
    ssl: { require: true, rejectUnauthorized: false },
  } : {},
});

sequelize.authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch((error) => console.error("❌ DB connection error:", error));

module.exports = sequelize;
