const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 320 },
  password: { type: String, required: true },
  skillsOffered: { type: [String], default: [] },
  skillsWanted: { type: [String], default: [] }
});

module.exports = mongoose.model("User", userSchema);
