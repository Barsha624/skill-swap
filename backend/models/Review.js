const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  learner: String,
  mentor: String,
  rating: Number,
  comment: String
});

module.exports = mongoose.model("Review", reviewSchema);