const express = require("express");
const { User } = require("../models");
const verifyFirebaseToken = require("../middleware/auth");

const router = express.Router();

router.post("/protected", verifyFirebaseToken, async (req, res) => {
  const { name, email, uid } = req.firebaseUser;

  try {
    const [user] = await User.findOrCreate({
      where: { firebaseuid: uid },
      defaults: { name: name || email, email, firebaseuid: uid },
    });

    if (user.email !== email || user.name !== (name || email)) {
      await user.update({ name: name || email, email });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("User synchronization failed:", error);
    return res.status(500).json({ message: "Failed to synchronize user" });
  }
});

module.exports = router;
