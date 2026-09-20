const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AnalyticsEvent = sequelize.define(
  "AnalyticsEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "analytics_events",
    timestamps: true,
    indexes: [
      { fields: ["name"] },
      { fields: ["eventId"] },
      { fields: ["createdAt"] },
    ],
  }
);

module.exports = AnalyticsEvent;