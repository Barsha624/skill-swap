const express = require("express");
const Message = require("../models/Message");
const User = require("../models/user");
const { requireAuth } = require("../middleware/auth");
const { str } = require("../middleware/security");

const router = express.Router();

router.post("/send", requireAuth, async (req, res) => {
  const receiver = str(req.body?.receiver, 60);
  const text = str(req.body?.message, 2000);
  if (!receiver || !text) return res.status(400).json({ message: "Receiver and message are required" });
  if (receiver === req.user.name) return res.status(400).json({ message: "You can't message yourself" });
  if (!(await User.exists({ name: receiver }))) return res.status(404).json({ message: "That user doesn't exist" });
  const saved = await Message.create({ sender: req.user.name, receiver, message: text });
  // Push in real time to both participants (each socket joined its own room on connect).
  req.app.get("io")?.to("user:" + receiver).to("user:" + req.user.name).emit("receiveMessage", saved);
  res.status(201).json(saved);
});

router.get("/:user1/:user2", requireAuth, async (req, res) => {
  const { user1, user2 } = req.params;
  if (req.user.name !== user1 && req.user.name !== user2) return res.status(403).json({ message: "Not your conversation" });
  res.json(await Message.find({
    $or: [{ sender: user1, receiver: user2 }, { sender: user2, receiver: user1 }],
  }).sort({ createdAt: 1 }).limit(500));
});

module.exports = router;
