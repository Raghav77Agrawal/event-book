// auth.test.js — place this at your project root, alongside the "middleware" folder

const mockVerifyIdToken = jest.fn();

jest.mock("./firebaseAdmin", () => ({
  auth: () => ({
    verifyIdToken: mockVerifyIdToken,
  }),
}));

const verifyFirebaseToken = require("./middleware/auth");

describe("verifyFirebaseToken middleware", () => {
  afterEach(() => {
    mockVerifyIdToken.mockReset();
  });

  it("returns 401 when no authorization header is present", async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await verifyFirebaseToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token missing or invalid format" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches req.user when token is valid", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "user123" });

    const req = { headers: { authorization: "Bearer validtoken" } };
    const res = {};
    const next = jest.fn();

    await verifyFirebaseToken(req, res, next);

    expect(req.user.uid).toBe("user123");
    expect(next).toHaveBeenCalled();
  });

  it("returns 401 when token verification fails", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("invalid token"));

    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await verifyFirebaseToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });
});