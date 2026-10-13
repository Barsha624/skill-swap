const express = require("express");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/all", requireAuth, async (req, res) => {
  res.json(await Notification.find({ user: req.user.name }).sort({ createdAt: -1 }).limit(50));
});

module.exports = router;
