const { QueryTypes } = require("sequelize");
const sequelize = require("../db");

const ensureLocalSchema = async () => {
  const [ticketsTable] = await sequelize.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tickets'`,
    { type: QueryTypes.SELECT }
  );

  if (!ticketsTable) return;

  const [userIdColumn] = await sequelize.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'userId'`,
    { type: QueryTypes.SELECT }
  );

  if (!userIdColumn) {
    await sequelize.query(`ALTER TABLE "tickets" ADD COLUMN "userId" INTEGER`);
    console.log("✅ Added missing tickets.userId column");
  }

  const enumValues = ["pending", "failed"];
  for (const value of enumValues) {
    await sequelize.query(`ALTER TYPE "enum_tickets_ticketType" ADD VALUE IF NOT EXISTS '${value}'`);
  }
};

module.exports = ensureLocalSchema;
