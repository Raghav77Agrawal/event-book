const express = require("express");
const { Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
const authenticatedUser = [verifyFirebaseToken, requireUser];
const serializePrice = (value) => Number(value).toFixed(2);

router.get("/mytickets", ...authenticatedUser, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id, ticketType: "booked" },
      order: [["createdAt", "DESC"]],
    });

    const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
      const event = await Event.findByPk(ticket.eventid);
      return {
        ...ticket.toJSON(),
        event: event && event.status === "approved" ? {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        } : null,
        price: serializePrice(ticket.price),
      };
    }));

    return res.json(enrichedTickets.filter((ticket) => ticket.event));
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/ticket/:id", ...authenticatedUser, async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({ message: "A valid ticket id is required" });
    }
    const ticket = await Ticket.findOne({ where: { id: ticketId, userId: req.user.id } });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const event = await Event.findByPk(ticket.eventid);
    if (!event || event.status !== "approved") return res.status(404).json({ message: "Ticket event not available" });
    return res.json({ ticketId: ticket.id, email: ticket.email, event, price: serializePrice(ticket.price), ticketType: ticket.ticketType, createdAt: ticket.createdAt });
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

module.exports = router;
