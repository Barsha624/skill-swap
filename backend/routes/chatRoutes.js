const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// SEND MESSAGE
router.post("/send", async (req, res) => {
  const { sender, receiver, message } = req.body;

  const newMessage = new Message({ sender, receiver, message });
  await newMessage.save();

  res.json({ message: "Message sent" });
});

// GET MESSAGES
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;