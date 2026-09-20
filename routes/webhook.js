const express = require("express");
const stripe = require("../config/stripe");
const Ticket = require("../models/ticket");

const router = express.Router();

router.post("/", async (req, res) => {
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const session = stripeEvent.data.object;
    const ticketId = session.metadata?.bookingId;
    if (!ticketId) return res.json({ received: true });

    if (stripeEvent.type === "checkout.session.completed") {
      await Ticket.update(
        { ticketType: "booked" },
        { where: { id: ticketId, ticketType: "pending" } }
      );
    }

    if (stripeEvent.type === "checkout.session.expired") {
      await Ticket.update({ ticketType: "cancelled" }, { where: { id: ticketId, ticketType: "pending" } });
    }

    if (stripeEvent.type === "payment_intent.payment_failed") {
      await Ticket.update({ ticketType: "failed" }, { where: { id: ticketId, ticketType: "pending" } });
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
});

module.exports = router;
