const express = require("express");
const stripe = require("../config/stripe");
const Ticket = require("../models/ticket");
const { Op } = require("sequelize");

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
    const eventObject = stripeEvent.data.object;

    if (stripeEvent.type === "checkout.session.completed") {
      const ticketId = Number(eventObject.metadata?.bookingId);
      if (Number.isInteger(ticketId) && ticketId > 0) {
        if (eventObject.payment_status === "paid") {
          await Ticket.update(
            { ticketType: "booked" },
            { where: { id: ticketId, ticketType: "pending" } }
          );
        } else {
          await Ticket.update(
            { ticketType: "failed" },
            { where: { id: ticketId, ticketType: "pending" } }
          );
        }
      }
    }

    if (["checkout.session.expired", "checkout.session.async_payment_failed"].includes(stripeEvent.type)) {
      const ticketId = Number(eventObject.metadata?.bookingId);
      if (Number.isInteger(ticketId) && ticketId > 0) {
        await Ticket.update(
          { ticketType: "cancelled" },
          { where: { id: ticketId, ticketType: "pending" } }
        );
      }
    }

    if (stripeEvent.type === "payment_intent.payment_failed") {
      const ticketId = Number(eventObject.metadata?.bookingId);
      if (Number.isInteger(ticketId) && ticketId > 0) {
        await Ticket.update(
          { ticketType: "failed" },
          { where: { id: ticketId, ticketType: { [Op.in]: ["pending", "failed"] } } }
        );
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
});

module.exports = router;
