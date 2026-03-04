const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    
    dialect: "postgres",
    dialectOptions: {
    ssl: {
      require: true,
      logging:false,
      rejectUnauthorized: false // Required for Neon/Render connections
    }
  }
  }
);

sequelize.authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

module.exports = sequelize;