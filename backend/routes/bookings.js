const express = require("express");
const { Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const requireUser = require("../middleware/requireUser");
const stripe = require("../config/stripe");
const { Op } = require("sequelize");
const { decimalStringToPaise } = require("../utils/money");

const router = express.Router();
const authenticatedUser = [verifyFirebaseToken, requireUser];

router.post("/bookticket", ...authenticatedUser, async (req, res) => {
  const eventId = Number(req.body.eventid);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ message: "A valid event is required" });
  }

  try {
    const event = await Event.findOne({ where: { id: eventId, status: "approved" } });
    if (!event) return res.status(404).json({ message: "Approved event not found" });

    const existingPending = await Ticket.findOne({
      where: {
        userId: req.user.id,
        eventid: event.id,
        ticketType: "pending",
        createdAt: { [Op.gte]: new Date(Date.now() - (30 * 60 * 1000)) },
      },
      order: [["createdAt", "DESC"]],
    });

    if (existingPending) {
      return res.status(409).json({
        message: "A payment session is already pending for this event. Complete or wait for it to expire before retrying.",
      });
    }

    const amountInPaise = decimalStringToPaise(event.price);
    if (!Number.isInteger(amountInPaise)) {
      return res.status(500).json({ message: "Event price configuration is invalid" });
    }

    const ticket = await Ticket.create({
      eventid: event.id,
      userId: req.user.id,
      email: req.user.email,
      price: event.price,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        line_items: [{
          price_data: {
            currency: "inr",
            product_data: { name: event.title },
            unit_amount: amountInPaise,
          },
          quantity: 1,
        }],
        success_url: `${process.env.frontendurl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.frontendurl}/payment-cancel`,
        metadata: {
          bookingId: String(ticket.id),
          eventId: String(event.id),
          userId: String(req.user.id),
        },
      });

      return res.json({ url: session.url, id: ticket.id });
    } catch (stripeError) {
      await ticket.destroy();
      throw stripeError;
    }
  } catch (error) {
    console.error("Payment initialization failed:", error);
    return res.status(500).json({ message: "Payment initialization failed" });
  }
});

router.get("/verify-session/:sessionId", ...authenticatedUser, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const ticketId = Number(session.metadata?.bookingId);
    const metadataUserId = Number(session.metadata?.userId);
    const metadataEventId = Number(session.metadata?.eventId);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = await Ticket.findOne({
      where: { id: ticketId, userId: req.user.id },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if ((Number.isInteger(metadataUserId) && metadataUserId !== req.user.id)
      || (Number.isInteger(metadataEventId) && metadataEventId !== ticket.eventid)) {
      return res.status(403).json({ message: "Payment session does not belong to this user" });
    }

    const event = await Event.findByPk(ticket.eventid);
    if (!event || event.status !== "approved") {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json({
      status: ticket.ticketType,
      paymentStatus: session.payment_status,
      event,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify payment session" });
  }
});

module.exports = router;
