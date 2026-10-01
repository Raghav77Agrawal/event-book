const stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

module.exports = stripe(process.env.STRIPE_SECRET_KEY);
