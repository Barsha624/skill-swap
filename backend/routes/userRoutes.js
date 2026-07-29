const jwt = require("jsonwebtoken");

const express = require("express");
const router = express.Router();
const User = require("../models/user");

// REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();
  res.json({ message: "User registered" });
});

// GET ALL USERS 👇 (ADD THIS)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/match/:skill", async (req, res) => {
  try {
    const skill = req.params.skill;

    const users = await User.find({
      skillsOffered: { $regex: skill, $options: "i" }
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Matching failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey123",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
router.put("/update/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/recommend/:skill", async (req, res) => {
  try {
    const skill = req.params.skill.toLowerCase();

    const users = await User.find();

    const matched = users.filter(u =>
      u.skillsOffered.some(s =>
        s.toLowerCase().includes(skill)
      )
    );

    res.json(matched);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;