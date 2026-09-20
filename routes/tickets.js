const express = require("express");
const { Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
const authenticatedUser = [verifyFirebaseToken, requireUser];

router.get("/mytickets", ...authenticatedUser, async (req, res) => {
  try {
    // Return all tickets belonging to the authenticated user. A pending or
    // failed payment should remain visible so the user can understand its
    // current status instead of seeing an empty bookings page.
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
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
    console.error("Failed to fetch tickets:", error);
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/ticket/:id", ...authenticatedUser, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: { id: req.params.id, userId: req.user.id },
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
    console.error("Failed to fetch ticket:", error);
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

module.exports = router;
