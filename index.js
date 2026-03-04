require("dotenv").config();
const express = require('express');
const cors = require('cors');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Models & DB
const sequelize = require("./db");
const User = require("./models/user.js");
const Event = require("./models/event.js");
const Ticket = require("./models/ticket.js");

// Middleware
const vt = require('./middleware/auth.js');

const app = express();

// -----------------------------------------------------------
// 1. STRIPE WEBHOOK (Must stay above express.json())
// -----------------------------------------------------------
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("❌ Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;
  const ticketId = session.metadata?.bookingId;

  switch (event.type) {
    case 'checkout.session.completed':
      console.log(`✅ Payment success for Ticket: ${ticketId}`);
      await Ticket.update({ ticketType: "booked" }, { where: { id: ticketId } });
      break;

    case 'checkout.session.expired':
    case 'payment_intent.payment_failed':
      if (ticketId) {
        console.log(`❌ Payment failed for Ticket: ${ticketId}`);
        await Ticket.update({ ticketType: "cancelled" }, { where: { id: ticketId } });
      }
      break;
  }

  res.json({ received: true });
});

// -----------------------------------------------------------
// 2. STANDARD MIDDLEWARE
// -----------------------------------------------------------
app.use(express.json());
app.use(cors({
  origin: process.env.frontendurl, 
  credentials: true
}));

// -----------------------------------------------------------
// 3. USER ROUTES
// -----------------------------------------------------------
app.post('/protected', vt, async (req, res) => {
  const { name, email, uid } = req.user;
  try {
    let user = await User.findOne({ where: { firebaseuid: uid } });
    if (!user) {
      user = await User.create({ name, email, firebaseuid: uid });
    }
    res.status(200).json({ message: 'ok' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------------------------------------
// 4. EVENT ROUTES (Public & Organizer)
// -----------------------------------------------------------
app.get('/view-events', async (req, res) => {
  try {
    const events = await Event.findAll({ where: { status: 'approved' } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get('/view-event/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

app.post('/add-event', async (req, res) => {
  const { name, description, date, time, venue, price, organizer } = req.body;
  try {
    await Event.create({
      title: name,
      description,
      date,
      time,
      location: venue,
      price,
      createdBy: organizer,
      status: 'pending' // Good practice to default to pending
    });
    res.status(200).json({ message: 'done successfully' });
  } catch (e) {
    res.status(500).json({ error: "Failed to add event" });
  }
});

// -----------------------------------------------------------
// 5. ADMIN ROUTES
// -----------------------------------------------------------
app.get('/pending-req', async (req, res) => {
  try {
    const pendingEvents = await Event.findAll({ where: { status: 'pending' } });
    res.json(pendingEvents);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
});

app.post('/approve', async (req, res) => {
  await Event.update({ status: "approved" }, { where: { id: req.body.eventid } });
  res.status(200).json({ msg: "ok" });
});

app.post('/reject', async (req, res) => {
  await Event.update({ status: "rejected" }, { where: { id: req.body.eventid } });
  res.status(200).json({ msg: "ok" });
});

// -----------------------------------------------------------
// 6. BOOKING & PAYMENT ROUTES
// -----------------------------------------------------------
app.post('/bookticket', vt, async (req, res) => {
  const { email } = req.user;
  const { eventid } = req.body;

  try {
    const ev = await Event.findByPk(eventid);
    const x = await Ticket.create({ eventid, email, price: ev.price });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      line_items: [{
        price_data: {
          currency: "inr",
          product_data: { name: ev.title },
          unit_amount: ev.price * 100,
        },
        quantity: 1,
      }],
      success_url: `${process.env.frontendurl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.backendurl}/cancel-and-delete?ticketId=${x.id}`,
      metadata: { bookingId: x.id },
    });

    res.json({ url: session.url, id: x.id });
  } catch (e) {
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

app.get('/cancel-and-delete', async (req, res) => {
  const { ticketId } = req.query;
  if (ticketId) {
    await Ticket.destroy({ where: { id: ticketId } });
    console.log(`Ticket ${ticketId} cleaned up.`);
  }
  res.redirect(`${process.env.frontendurl}/payment-cancel`);
});

app.get('/mytickets', vt, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({ 
      where: { email: req.user.email, ticketType: 'booked' } 
    });
    
    // Using a more efficient map for enrichment
    const enrichedTickets = await Promise.all(tickets.map(async (ticket) => {
      const event = await Event.findByPk(ticket.eventid);
      return {
        ...ticket.toJSON(),
        event: event ? { title: event.title, date: event.date, time: event.time, location: event.location } : null
      };
    }));

    res.status(200).json(enrichedTickets.filter(t => t.event));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});
app.get('/ticket/:id', vt, async (req, res) => {

  const ticketId = req.params.id;

  try {

    const ticket = await Ticket.findOne({

      where: { id: ticketId },

     

    });



    if (!ticket) {

      return res.status(404).json({ error: "Ticket not found" });

    }

    const event = await Event.findOne({where:{id:ticket.eventid}});

    res.status(200).json({

      ticketId: ticket.id,

      email: ticket.email,

      event: event,  // Includes title, date, time, etc.

      price: ticket.price,

      ticketType: ticket.ticketType,

      createdAt: ticket.createdAt

    });



  } catch (e) {

    console.log(e);

    res.status(500).json({ error: "Failed to fetch ticket" });

  }

});
app.get('/verify-session/:sessionId', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  const ticket = await Ticket.findByPk(session.metadata.bookingId);
  const event = await Event.findByPk(ticket.eventid);
  res.json({ status: ticket.ticketType, event });
});

// -----------------------------------------------------------
// 7. SERVER STARTUP
// -----------------------------------------------------------
sequelize.sync({ force: false })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
  })
  .catch((err) => console.error("Database Error:", err));