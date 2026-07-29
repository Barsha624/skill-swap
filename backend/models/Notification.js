const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);