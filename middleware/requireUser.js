const { User } = require("../models");

const requireUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { firebaseuid: req.firebaseUser.uid },
    });

    if (!user) {
      return res.status(403).json({ message: "User profile not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user profile" });
  }
};

module.exports = requireUser;
