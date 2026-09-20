const express = require("express");
const cors = require("cors");
const webhookRoutes = require("./routes/webhook");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const ticketRoutes = require("./routes/tickets");

const app = express();

// Stripe requires the original request body for signature verification.
app.use("/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use(cors({
  origin: process.env.frontendurl,
  credentials: true,
}));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(userRoutes);
app.use(eventRoutes);
app.use(adminRoutes);
app.use(bookingRoutes);
app.use(ticketRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
