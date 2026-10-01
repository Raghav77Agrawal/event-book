const express = require("express");
const { Event } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");

const router = express.Router();
const authenticatedUser = [verifyFirebaseToken, requireUser];

const parseEventInput = (body) => {
  const title = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const location = typeof body.venue === "string" ? body.venue.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";
  const price = Number(body.price);

  const errors = {};
  if (title.length < 3 || title.length > 120) errors.title = "Title must be 3-120 characters";
  if (description.length < 10 || description.length > 5000) errors.description = "Description must be 10-5000 characters";
  if (!location || location.length > 255) errors.location = "A valid venue is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Date must use YYYY-MM-DD format";
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Time must use HH:mm format";
  if (!Number.isFinite(price) || price < 0 || price > 10000000) errors.price = "Price must be between 0 and 10000000";

  if (date && time) {
    const startsAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      errors.date = "Event date and time must be in the future";
    }
  }

  return { errors, values: { title, description, location, date, time, price } };
};

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

router.post("/add-event", ...authenticatedUser, async (req, res) => {
  const { errors, values } = parseEventInput(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: "Invalid event details", errors });
  }

  try {
    const event = await Event.create({
      ...values,
      status: "pending",
      createdBy: req.user.name || req.user.email,
    });

    return res.status(201).json({ message: "Event submitted for review", event });
  } catch (error) {
    console.error("Event creation failed:", error);
    return res.status(500).json({ message: "Failed to add event" });
  }
});

module.exports = router;
