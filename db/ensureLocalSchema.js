const { QueryTypes } = require("sequelize");
const sequelize = require("../db");

/**
 * Applies only additive, backwards-compatible changes required by the current
 * application. This is intentionally idempotent so local startup can be
 * repeated safely while the project does not yet have a migration runner.
 * Replace this with versioned migrations before production deployment.
 */
const ensureLocalSchema = async () => {
  const [ticketsTable] = await sequelize.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tickets'`,
    { type: QueryTypes.SELECT }
  );

  if (!ticketsTable) return;

  const [userIdColumn] = await sequelize.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'tickets'
       AND column_name = 'userId'`,
    { type: QueryTypes.SELECT }
  );

  if (!userIdColumn) {
    await sequelize.query(`ALTER TABLE "tickets" ADD COLUMN "userId" INTEGER`);
    console.log('✅ Added missing tickets.userId column');
  }
};

module.exports = ensureLocalSchema;
