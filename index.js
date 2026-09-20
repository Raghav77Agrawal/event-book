require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Op } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Models & DB
const { sequelize, User, Event, Ticket } = require("./models");

// Middleware
const verifyFirebaseToken = require("./middleware/auth.js");
const requireAdmin = require("./middleware/admin.js");

const app = express();

// Stripe webhook must be registered before express.json().
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const session = event.data.object;
    const ticketId = session.metadata?.bookingId;

    if (ticketId) {
      switch (event.type) {
        case "checkout.session.completed":
          await Ticket.update(
            { ticketType: "booked" },
            { where: { id: ticketId, ticketType: "cancelled" } }
          );
          break;
        case "checkout.session.expired":
        case "payment_intent.payment_failed":
          await Ticket.update(
            { ticketType: "cancelled" },
            { where: { id: ticketId } }
          );
          break;
        default:
          break;
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
});

app.use(express.json());
app.use(cors({
  origin: process.env.frontendurl,
  credentials: true,
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Synchronize the authenticated Firebase user with the application user record.
app.post("/protected", verifyFirebaseToken, async (req, res) => {
  const { name, email, uid } = req.firebaseUser;

  try {
    const [user] = await User.findOrCreate({
      where: { firebaseuid: uid },
      defaults: { name: name || email, email, firebaseuid: uid },
    });

    if (user.email !== email || user.name !== (name || email)) {
      await user.update({ name: name || email, email });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("User synchronization failed:", error);
    return res.status(500).json({ message: "Failed to synchronize user" });
  }
});

// Public event routes.
app.get("/view-events", async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: "approved" } });
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get("/view-event/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Only authenticated users may submit events. Ownership is derived server-side.
app.post("/add-event", verifyFirebaseToken, async (req, res) => {
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

// Admin-only routes.
app.get("/pending-req", verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    const pendingEvents = await Event.findAll({ where: { status: "pending" } });
    return res.json(pendingEvents);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

app.post("/approve", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const [updatedCount] = await Event.update(
    { status: "approved" },
    { where: { id: req.body.eventid, status: "pending" } }
  );

  if (!updatedCount) return res.status(404).json({ message: "Pending event not found" });
  return res.status(200).json({ message: "Event approved" });
});

app.post("/reject", verifyFirebaseToken, requireAdmin, async (req, res) => {
  const [updatedCount] = await Event.update(
    { status: "cancelled" },
    { where: { id: req.body.eventid, status: "pending" } }
  );

  if (!updatedCount) return res.status(404).json({ message: "Pending event not found" });
  return res.status(200).json({ message: "Event rejected" });
});

// A user can only create a ticket for an approved event.
app.post("/bookticket", verifyFirebaseToken, async (req, res) => {
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

app.get("/mytickets", verifyFirebaseToken, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: {
        ticketType: "booked",
        [Op.or]: [{ userId: req.user.id }, { email: req.user.email }],
      },
    });

    const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
      const event = await Event.findByPk(ticket.eventid);
      return { ...ticket.toJSON(), event: event ? {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
      } : null };
    }));

    return res.status(200).json(enrichedTickets.filter((ticket) => ticket.event));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

app.get("/ticket/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ userId: req.user.id }, { email: req.user.email }],
      },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const event = await Event.findByPk(ticket.eventid);
    return res.json({
      ticketId: ticket.id,
      email: ticket.email,
      event,
      price: ticket.price,
      ticketType: ticket.ticketType,
      createdAt: ticket.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

app.get("/verify-session/:sessionId", verifyFirebaseToken, async (req, res) => {
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

sequelize.sync({ force: false })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
  })
  .catch((error) => console.error("Database Error:", error));
