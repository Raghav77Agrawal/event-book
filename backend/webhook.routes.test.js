const request = require("supertest");
const express = require("express");

const mockConstructEvent = jest.fn();
const mockUpdateTicket = jest.fn();

jest.mock("./config/stripe", () => ({
  webhooks: {
    constructEvent: (...args) => mockConstructEvent(...args),
  },
}));

jest.mock("./models/ticket", () => ({
  update: (...args) => mockUpdateTicket(...args),
}));

const webhookRoutes = require("./routes/webhook");

describe("webhook routes", () => {
  const app = express();
  app.use("/webhook", express.raw({ type: "application/json" }), webhookRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks pending ticket as booked on checkout.session.completed with paid status", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { metadata: { bookingId: "5" }, payment_status: "paid" } },
    });
    mockUpdateTicket.mockResolvedValue([1]);

    const response = await request(app)
      .post("/webhook")
      .set("stripe-signature", "signature")
      .set("content-type", "application/json")
      .send(Buffer.from("{}"));

    expect(response.status).toBe(200);
    expect(mockUpdateTicket).toHaveBeenCalledWith(
      { ticketType: "booked" },
      { where: { id: 5, ticketType: "pending" } }
    );
  });

  it("marks pending ticket as cancelled on checkout.session.expired", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.expired",
      data: { object: { metadata: { bookingId: "6" } } },
    });
    mockUpdateTicket.mockResolvedValue([1]);

    const response = await request(app)
      .post("/webhook")
      .set("stripe-signature", "signature")
      .set("content-type", "application/json")
      .send(Buffer.from("{}"));

    expect(response.status).toBe(200);
    expect(mockUpdateTicket).toHaveBeenCalledWith(
      { ticketType: "cancelled" },
      { where: { id: 6, ticketType: "pending" } }
    );
  });

  it("returns 400 when signature validation fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const response = await request(app)
      .post("/webhook")
      .set("stripe-signature", "bad-signature")
      .set("content-type", "application/json")
      .send(Buffer.from("{}"));

    expect(response.status).toBe(400);
  });
});
