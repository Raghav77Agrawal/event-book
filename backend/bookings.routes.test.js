const request = require("supertest");
const express = require("express");

const mockFindEvent = jest.fn();
const mockFindTicket = jest.fn();
const mockCreateTicket = jest.fn();
const mockRetrieveSession = jest.fn();
const mockCreateSession = jest.fn();

jest.mock("./models", () => ({
  Event: {
    findOne: (...args) => mockFindEvent(...args),
    findByPk: jest.fn().mockResolvedValue({ id: 1, title: "Event" }),
  },
  Ticket: {
    findOne: (...args) => mockFindTicket(...args),
    create: (...args) => mockCreateTicket(...args),
  },
}));

jest.mock("./config/stripe", () => ({
  checkout: {
    sessions: {
      create: (...args) => mockCreateSession(...args),
      retrieve: (...args) => mockRetrieveSession(...args),
    },
  },
}));

jest.mock("./middleware/auth", () => (req, res, next) => {
  req.firebaseUser = { uid: "firebase-1" };
  next();
});

jest.mock("./middleware/requireUser", () => (req, res, next) => {
  req.user = { id: 25, email: "user@example.com" };
  next();
});

const bookingRoutes = require("./routes/bookings");

describe("booking routes", () => {
  const app = express();
  app.use(express.json());
  app.use(bookingRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates Stripe session with integer amount and metadata", async () => {
    mockFindEvent.mockResolvedValue({ id: 1, title: "Demo", price: "499.50" });
    mockFindTicket.mockResolvedValueOnce(null);

    const ticket = { id: 42, destroy: jest.fn() };
    mockCreateTicket.mockResolvedValue(ticket);
    mockCreateSession.mockResolvedValue({ url: "https://checkout.stripe.com/demo" });

    const response = await request(app).post("/bookticket").send({ eventid: 1 });

    expect(response.status).toBe(200);
    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      line_items: [expect.objectContaining({
        price_data: expect.objectContaining({ unit_amount: 49950 }),
      })],
      metadata: expect.objectContaining({
        bookingId: "42",
        eventId: "1",
        userId: "25",
      }),
    }));
  });

  it("blocks duplicate active pending booking attempts", async () => {
    mockFindEvent.mockResolvedValue({ id: 1, title: "Demo", price: "499.50" });
    mockFindTicket.mockResolvedValueOnce({ id: 44, ticketType: "pending" });

    const response = await request(app).post("/bookticket").send({ eventid: 1 });
    expect(response.status).toBe(409);
  });

  it("prevents verify-session when metadata user does not match", async () => {
    mockRetrieveSession.mockResolvedValue({
      metadata: { bookingId: "2", userId: "999", eventId: "1" },
      payment_status: "paid",
    });
    mockFindTicket.mockResolvedValue({ id: 2, userId: 25, eventid: 1, ticketType: "booked" });

    const response = await request(app).get("/verify-session/sess_123");

    expect(response.status).toBe(403);
  });
});
