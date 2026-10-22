const express = require("express");
const { Event } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");
const { createError } = require("../utils/errors");
const { decimalStringToPaise, paiseToDecimalString } = require("../utils/money");

const router = express.Router();
const authenticatedUser = [verifyFirebaseToken, requireUser];

const parseEventInput = (body) => {
  const title = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const location = typeof body.venue === "string" ? body.venue.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const time = typeof body.time === "string" ? body.time.trim() : "";
  const priceInPaise = decimalStringToPaise(body.price);

  const errors = {};
  if (title.length < 3 || title.length > 120) errors.title = "Title must be 3-120 characters";
  if (description.length < 10 || description.length > 5000) errors.description = "Description must be 10-5000 characters";
  if (!location || location.length > 255) errors.location = "A valid venue is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Date must use YYYY-MM-DD format";
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Time must use HH:mm format";
  if (!Number.isInteger(priceInPaise) || priceInPaise < 0 || priceInPaise > 1000000000) {
    errors.price = "Price must be between 0.00 and 10000000.00";
  }

  if (date && time) {
    const startsAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      errors.date = "Event date and time must be in the future";
    }
  }

  return { errors, values: { title, description, location, date, time, priceInPaise } };
};

const serializeEvent = (event) => {
  const payload = event.toJSON();
  return {
    ...payload,
    price: Number(payload.price).toFixed(2),
  };
};

router.get("/view-events", async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: "approved" } });
    return res.json(events.map(serializeEvent));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/view-event/:id", async (req, res) => {
  try {
    const eventId = Number(req.params.id);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      throw createError(400, "A valid event id is required");
    }

    const event = await Event.findOne({ where: { id: eventId, status: "approved" } });
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(serializeEvent(event));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.statusCode ? error.message : "Failed to fetch event" });
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
      price: paiseToDecimalString(values.priceInPaise),
      status: "pending",
      createdBy: req.user.name || req.user.email,
    });

    return res.status(201).json({ message: "Event submitted for review", event: serializeEvent(event) });
  } catch (error) {
    console.error("Event creation failed:", error);
    return res.status(500).json({ message: "Failed to add event" });
  }
});

module.exports = router;
