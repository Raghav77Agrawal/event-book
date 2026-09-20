require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const ensureLocalSchema = require("./db/ensureLocalSchema");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    await ensureLocalSchema();

    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database startup error:", error);
    process.exit(1);
  }
};

startServer();
