const express = require("express");
const { Event, Ticket } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");
const stripe = require("../config/stripe");
const { Op } = require("sequelize");

const router = express.Router();

router.post("/bookticket", verifyFirebaseToken, async (req, res) => {
  const { eventid } = req.body;

  try {
    const event = await Event.findOne({ where: { id: eventid, status: "approved" } });
    if (!event) return res.status(404).json({ message: "Approved event not found" });

    const ticket = await Ticket.create({
      eventid: event.id,
      userId: req.user.id,
      email: req.user.email,
      price: event.price,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: event.title },
          unit_amount: Math.round(Number(event.price) * 100),
        },
        quantity: 1,
      }],
      success_url: `${process.env.frontendurl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.frontendurl}/payment-cancel`,
      metadata: { bookingId: String(ticket.id) },
    });

    return res.json({ url: session.url, id: ticket.id });
  } catch (error) {
    console.error("Payment initialization failed:", error);
    return res.status(500).json({ message: "Payment initialization failed" });
  }
});

router.get("/verify-session/:sessionId", verifyFirebaseToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const ticket = await Ticket.findOne({
      where: {
        id: session.metadata?.bookingId,
        [Op.or]: [{ userId: req.user.id }, { email: req.user.email }],
      },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    const event = await Event.findByPk(ticket.eventid);
    return res.json({ status: ticket.ticketType, event });
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify payment session" });
  }
});

module.exports = router;
