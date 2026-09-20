const express = require("express");
const { Op, fn, col, literal } = require("sequelize");
const { User, Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");
const requireAdmin = require("../middleware/admin");

const router = express.Router();
const adminOnly = [verifyFirebaseToken, requireUser, requireAdmin];

router.get("/admin/analytics", ...adminOnly, async (req, res) => {
  try {
    const [totalEvents, approvedEvents, pendingEvents, totalUsers, bookedTickets, revenue, ticketBreakdown, topEvents] = await Promise.all([
      Event.count(),
      Event.count({ where: { status: "approved" } }),
      Event.count({ where: { status: "pending" } }),
      User.count(),
      Ticket.count({ where: { ticketType: "booked" } }),
      Ticket.sum("price", { where: { ticketType: "booked" } }),
      Ticket.findAll({
        attributes: ["ticketType", [fn("COUNT", col("id")), "count"]],
        group: ["ticketType"],
        raw: true,
      }),
      Event.findAll({
        attributes: [
          "id",
          "title",
          [literal("(SELECT COUNT(*) FROM tickets WHERE tickets.eventid = \"Event\".id AND tickets.\"ticketType\" = 'booked')"), "bookedTickets"],
        ],
        order: [[literal("\"bookedTickets\""), "DESC"]],
        limit: 5,
        raw: true,
      }),
    ]);

    return res.json({
      totals: {
        events: totalEvents,
        approvedEvents,
        pendingEvents,
        users: totalUsers,
        bookedTickets,
        revenue: Number(revenue || 0),
      },
      ticketBreakdown,
      topEvents,
    });
  } catch (error) {
    console.error("Failed to load admin analytics:", error);
    return res.status(500).json({ message: "Failed to load analytics" });
  }
});

module.exports = router;
