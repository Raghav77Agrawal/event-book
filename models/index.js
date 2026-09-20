// models/index.js
const sequelize = require("../db");
const User = require("./user");
const Event = require("./event");
const Ticket = require("./ticket");

User.hasMany(Ticket, { foreignKey: "userId", as: "tickets" });
Ticket.belongsTo(User, { foreignKey: "userId", as: "user" });

Event.hasMany(Ticket, { foreignKey: "eventid", as: "tickets" });
Ticket.belongsTo(Event, { foreignKey: "eventid", as: "event" });

module.exports = { sequelize, User, Event, Ticket };
