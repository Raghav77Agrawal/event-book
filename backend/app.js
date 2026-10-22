const express = require("express");
const cors = require("cors");
const webhookRoutes = require("./routes/webhook");
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const adminRoutes = require("./routes/admin");
const bookingRoutes = require("./routes/bookings");
const ticketRoutes = require("./routes/tickets");
const analyticsRoutes = require("./routes/analytics");
const { AppError } = require("./utils/errors");

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
app.use(analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const statusCode = error instanceof AppError && Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  if (statusCode >= 500) {
    console.error("Unhandled server error:", error);
  }

  const response = { message };
  if (statusCode < 500 && error.details) {
    response.details = error.details;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
