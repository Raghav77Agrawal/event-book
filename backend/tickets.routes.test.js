const request = require("supertest");
const express = require("express");

const mockFindTickets = jest.fn();
const mockFindTicket = jest.fn();
const mockFindEvent = jest.fn();

jest.mock("./models", () => ({
  Event: {
    findByPk: (...args) => mockFindEvent(...args),
  },
  Ticket: {
    findAll: (...args) => mockFindTickets(...args),
    findOne: (...args) => mockFindTicket(...args),
  },
}));

jest.mock("./middleware/auth", () => (req, res, next) => {
  req.firebaseUser = { uid: "firebase-1" };
  next();
});

jest.mock("./middleware/requireUser", () => (req, res, next) => {
  req.user = { id: 7, email: "owner@example.com" };
  next();
});

const ticketRoutes = require("./routes/tickets");

describe("ticket routes", () => {
  const app = express();
  app.use(express.json());
  app.use(ticketRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects invalid ticket id parameter", async () => {
    const response = await request(app).get("/ticket/invalid");
    expect(response.status).toBe(400);
  });

  it("returns 404 when ticket event is not approved", async () => {
    mockFindTicket.mockResolvedValue({ id: 2, eventid: 3, email: "owner@example.com" });
    mockFindEvent.mockResolvedValue({ id: 3, status: "rejected" });

    const response = await request(app).get("/ticket/2");
    expect(response.status).toBe(404);
  });

  it("filters mytickets to only include approved events", async () => {
    mockFindTickets.mockResolvedValue([{
      id: 3,
      eventid: 4,
      price: "250.00",
      createdAt: new Date(),
      ticketType: "booked",
      toJSON() {
        return {
          id: this.id,
          eventid: this.eventid,
          price: this.price,
          createdAt: this.createdAt,
          ticketType: this.ticketType,
        };
      },
    }]);
    mockFindEvent.mockResolvedValue({ id: 4, status: "approved", title: "Hackathon", date: "2099-12-31", time: "10:00", location: "Campus" });

    const response = await request(app).get("/mytickets");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].price).toBe("250.00");
  });
});
