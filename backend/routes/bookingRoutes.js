const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

// Create booking
router.post("/book", async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json({ message: "Booking created successfully" });
});

// Get all bookings
router.get("/all", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

//status update root
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Notification.create({
      user: booking.learner,
      message: `Your booking for ${booking.skill} was ${status}`
    });

    res.json({ message: "Booking updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;