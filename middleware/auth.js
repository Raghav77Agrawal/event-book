// middleware/auth.js
const admin = require("../firebaseAdmin");
const User = require("../models/user");

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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({
      where: { firebaseuid: decodedToken.uid },
    });

    if (!user) {
      return res.status(403).json({
        message: "User profile not found. Complete account setup first.",
      });
    }

    req.firebaseUser = decodedToken;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyFirebaseToken;
