const request = require("supertest");
const express = require("express");

const mockFindAll = jest.fn();
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

jest.mock("./models", () => ({
  Event: {
  findAll: (...args) => mockFindAll(...args),
  findOne: (...args) => mockFindOne(...args),
  create: (...args) => mockCreate(...args),
  },
}));

jest.mock("./middleware/auth", () => (req, res, next) => {
  req.firebaseUser = { uid: "firebase-1" };
  next();
});

jest.mock("./middleware/requireUser", () => (req, res, next) => {
  req.user = { id: 10, name: "Test User", email: "test@example.com" };
  next();
});

const eventsRoutes = require("./routes/events");

const makeEvent = (overrides = {}) => ({
  toJSON: () => ({
    id: 1,
    title: "Tech Fest",
    description: "A full day event",
    location: "IET",
    date: "2027-02-01",
    time: "09:00",
    status: "approved",
    price: "499.00",
    createdBy: "Admin",
    ...overrides,
  }),
});

describe("events routes", () => {
  const app = express();
  app.use(express.json());
  app.use(eventsRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns only approved event on /view-event/:id", async () => {
    mockFindOne.mockResolvedValue(makeEvent());

    const response = await request(app).get("/view-event/1");

    expect(response.status).toBe(200);
    expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 1, status: "approved" } });
    expect(response.body.price).toBe("499.00");
  });

  it("rejects invalid event id", async () => {
    const response = await request(app).get("/view-event/not-a-number");
    expect(response.status).toBe(400);
  });

  it("creates pending event with decimal-safe price", async () => {
    const newEvent = makeEvent({ id: 2, status: "pending" });
    mockCreate.mockResolvedValue(newEvent);

    const response = await request(app)
      .post("/add-event")
      .send({
        name: "Annual Meetup",
        description: "Community meetup event for students",
        venue: "Hall A",
        date: "2099-12-31",
        time: "12:30",
        price: "199.50",
      });

    expect(response.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      price: "199.50",
      status: "pending",
    }));
  });
});
