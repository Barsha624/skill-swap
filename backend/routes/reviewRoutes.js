const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// Add review
router.post("/add", async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.json({ message: "Review added successfully" });
});

// Get all reviews
router.get("/all", async (req, res) => {
  const reviews = await Review.find();
  res.json(reviews);
});

module.exports = router;