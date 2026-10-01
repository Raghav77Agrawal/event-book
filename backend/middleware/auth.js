const admin = require("../firebaseAdmin");

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const [, idToken] = authHeader.split(" ");

  if (!idToken) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyFirebaseToken;
