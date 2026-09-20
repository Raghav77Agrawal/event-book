// models/index.js
const sequelize = require("../db");
const User = require("./user");
const Event = require("./event");
const Ticket = require("./ticket");
const AnalyticsEvent = require("./analyticsEvent");

User.hasMany(Ticket, { foreignKey: "userId", as: "tickets" });
Ticket.belongsTo(User, { foreignKey: "userId", as: "user" });

Event.hasMany(Ticket, { foreignKey: "eventid", as: "tickets" });
Ticket.belongsTo(Event, { foreignKey: "eventid", as: "event" });

User.hasMany(AnalyticsEvent, { foreignKey: "userId", as: "analyticsEvents" });
AnalyticsEvent.belongsTo(User, { foreignKey: "userId", as: "user" });
Event.hasMany(AnalyticsEvent, { foreignKey: "eventId", as: "analyticsEvents" });
AnalyticsEvent.belongsTo(Event, { foreignKey: "eventId", as: "event" });
Ticket.hasMany(AnalyticsEvent, { foreignKey: "ticketId", as: "analyticsEvents" });
AnalyticsEvent.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });

module.exports = { sequelize, User, Event, Ticket, AnalyticsEvent };
