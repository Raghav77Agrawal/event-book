const express = require("express");
const { Event } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");
const requireAdmin = require("../middleware/admin");

const router = express.Router();
const adminOnly = [verifyFirebaseToken, requireUser, requireAdmin];
const serializeEvent = (event) => ({
  ...event.toJSON(),
  price: Number(event.price).toFixed(2),
});

router.get("/pending-req", ...adminOnly, async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: "pending" } });
    return res.json(events.map(serializeEvent));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

router.get("/admin/event/:id", ...adminOnly, async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ message: "A valid event id is required" });
  }

  const event = await Event.findByPk(eventId);
  if (!event) return res.status(404).json({ message: "Event not found" });
  return res.json(serializeEvent(event));
});

router.post("/approve", ...adminOnly, async (req, res) => {
  const [updatedCount] = await Event.update(
    { status: "approved" },
    { where: { id: req.body.eventid, status: "pending" } }
  );

  if (!updatedCount) return res.status(404).json({ message: "Pending event not found" });
  return res.json({ message: "Event approved" });
});

router.post("/reject", ...adminOnly, async (req, res) => {
  const [updatedCount] = await Event.update(
    { status: "rejected" },
    { where: { id: req.body.eventid, status: "pending" } }
  );

  if (!updatedCount) return res.status(404).json({ message: "Pending event not found" });
  return res.json({ message: "Event rejected" });
});

module.exports = router;
