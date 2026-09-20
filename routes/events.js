const express = require("express");
const { Event } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

router.get("/view-events", async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: "approved" } });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/view-event/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch event" });
  }
});

router.post("/add-event", verifyFirebaseToken, async (req, res) => {
  const { name, description, date, time, venue, price } = req.body;

  try {
    const event = await Event.create({
      title: name,
      description,
      date,
      time,
      location: venue,
      price,
      createdBy: req.user.name || req.user.email,
      status: "pending",
    });

    return res.status(201).json({ message: "Event submitted for review", event });
  } catch (error) {
    console.error("Event creation failed:", error);
    return res.status(500).json({ message: "Failed to add event" });
  }
});

module.exports = router;
