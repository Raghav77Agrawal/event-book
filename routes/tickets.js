const express = require("express");
const { Op } = require("sequelize");
const { Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

const ownershipWhere = (user, extra = {}) => ({
  ...extra,
  [Op.or]: [{ userId: user.id }, { email: user.email }],
});

router.get("/mytickets", verifyFirebaseToken, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: ownershipWhere(req.user, { ticketType: "booked" }),
    });

    const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
      const event = await Event.findByPk(ticket.eventid);
      return {
        ...ticket.toJSON(),
        event: event ? {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        } : null,
      };
    }));

    return res.json(enrichedTickets.filter((ticket) => ticket.event));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/ticket/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: ownershipWhere(req.user, { id: req.params.id }),
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const event = await Event.findByPk(ticket.eventid);
    return res.json({
      ticketId: ticket.id,
      email: ticket.email,
      event,
      price: ticket.price,
      ticketType: ticket.ticketType,
      createdAt: ticket.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

module.exports = router;
