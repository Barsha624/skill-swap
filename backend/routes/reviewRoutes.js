const express = require("express");
const Review = require("../models/Review");
const User = require("../models/user");
const { requireAuth } = require("../middleware/auth");
const { str } = require("../middleware/security");

const router = express.Router();

router.post("/add", requireAuth, async (req, res) => {
  const mentor = str(req.body?.mentor, 60);
  const rating = Number(req.body?.rating);
  if (!mentor || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(400).json({ message: "A mentor and a rating from 1 to 5 are required" });
  if (mentor === req.user.name) return res.status(400).json({ message: "You can't review yourself" });
  if (!(await User.exists({ name: mentor }))) return res.status(404).json({ message: "That mentor doesn't exist" });
  const review = await Review.create({ learner: req.user.name, mentor, rating, comment: str(req.body?.comment, 1000) });
  res.status(201).json(review);
});

router.get("/all", requireAuth, async (req, res) => {
  res.json(await Review.find().limit(1000));
});

module.exports = router;
