const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/user");
const { requireAuth } = require("../middleware/auth");
const { str } = require("../middleware/security");

const router = express.Router();
const STATUSES = ["Pending", "Accepted", "Rejected"];

router.post("/book", requireAuth, async (req, res) => {
  const mentor = str(req.body?.mentor, 60), skill = str(req.body?.skill, 60);
  const date = str(req.body?.date, 10), time = str(req.body?.time, 5);
  if (!mentor || !skill || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return res.status(400).json({ message: "Mentor, skill, a valid date and a valid time are required" });
  if (mentor === req.user.name) return res.status(400).json({ message: "You can't book yourself" });
  if (!(await User.exists({ name: mentor }))) return res.status(404).json({ message: "That mentor doesn't exist" });
  const booking = await Booking.create({ learner: req.user.name, mentor, skill, date, time });
  await Notification.create({ user: mentor, message: `${req.user.name} requested a ${skill} session` });
  res.status(201).json(booking);
});

// Only bookings the current user is part of.
router.get("/all", requireAuth, async (req, res) => {
  res.json(await Booking.find({ $or: [{ learner: req.user.name }, { mentor: req.user.name }] }));
});

router.put("/status/:id", requireAuth, async (req, res) => {
  const status = str(req.body?.status, 20);
  if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid booking id" });
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.mentor !== req.user.name) return res.status(403).json({ message: "Only the mentor can respond" });
  booking.status = status;
  await booking.save();
  await Notification.create({ user: booking.learner, message: `Your ${booking.skill} session was ${status.toLowerCase()}` });
  res.json(booking);
});

module.exports = router;
