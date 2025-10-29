// models/index.js
const User = require("./user");
const Event = require("./event");
const Ticket = require("./ticket");

// Associations
User.hasMany(Ticket);
Ticket.belongsTo(User);

Event.hasMany(Ticket,{foreignKey:"eventid"});
Ticket.belongsTo(Event,{foreignKey:"eventid"});

sequelize.sync({ alter: true })  // or force: true for dev
  .then(() => console.log("✅ Tables created/updated"));
module.exports = { User, Event, Ticket };
