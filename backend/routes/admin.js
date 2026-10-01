const express = require("express");
const { Event } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");
const requireAdmin = require("../middleware/admin");

const router = express.Router();
const adminOnly = [verifyFirebaseToken, requireUser, requireAdmin];

router.get("/pending-req", ...adminOnly, async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: "pending" } });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending requests" });
  }
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
    { status: "cancelled" },
    { where: { id: req.body.eventid, status: "pending" } }
  );

  if (!updatedCount) return res.status(404).json({ message: "Pending event not found" });
  return res.json({ message: "Event rejected" });
});

module.exports = router;
