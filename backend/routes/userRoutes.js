const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");
const Booking = require("../models/Booking");
const Message = require("../models/Message");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const { requireAuth, sign } = require("../middleware/auth");
const { rateLimit, str, escapeRegex, isEmail } = require("../middleware/security");

const router = express.Router();
const DUMMY_HASH = bcrypt.hashSync("exora-dummy", 10);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

const skillList = (v) =>
  (Array.isArray(v) ? v : [])
    .filter((s) => typeof s === "string")
    .map((s) => s.trim().slice(0, 40)).filter(Boolean).slice(0, 30);
const isHash = (s) => typeof s === "string" && /^\$2[aby]\$/.test(s);
const publicUser = (u) => { const o = u.toObject ? u.toObject() : { ...u }; delete o.password; delete o.__v; return o; };
const sameName = (name) => ({ name: { $regex: "^" + escapeRegex(name) + "$", $options: "i" } });

router.post("/register", authLimiter, async (req, res) => {
  const name = str(req.body?.name, 60);
  const email = str(req.body?.email, 320).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!name || !isEmail(email)) return res.status(400).json({ message: "A name and a valid email are required" });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ message: "Password must be 8–128 characters" });
  if (await User.findOne({ email })) return res.status(409).json({ message: "An account with that email already exists" });
  // Names identify people in sessions/chat, so they must be unique.
  if (await User.findOne(sameName(name))) return res.status(409).json({ message: "That name is already taken — pick another" });
  await User.create({
    name, email, password: await bcrypt.hash(password, 10),
    skillsOffered: skillList(req.body?.skillsOffered), skillsWanted: skillList(req.body?.skillsWanted),
  });
  res.status(201).json({ message: "User registered" });
});

router.post("/login", authLimiter, async (req, res) => {
  const email = str(req.body?.email, 320).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 128) : "";
  const user = email && password ? await User.findOne({ email }) : null;
  let ok = false;
  if (user) {
    if (isHash(user.password)) ok = await bcrypt.compare(password, user.password);
    else if (user.password === password) {            // legacy plain-text account: upgrade on first login
      ok = true;
      user.password = await bcrypt.hash(password, 10);
      await user.save();
    }
  } else {
    await bcrypt.compare(password || "x", DUMMY_HASH); // keep response time similar for unknown emails
  }
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });
  res.json({ message: "Login successful", token: sign(user), user: publicUser(user) });
});

// Directory of people: logged-in users only, and never exposes emails or passwords.
router.get("/users", requireAuth, async (req, res) => {
  res.json(await User.find().select("-password -email -__v").limit(500));
});

const matchSkill = async (req, res) => {
  const skill = str(req.params.skill, 40);
  if (!skill) return res.json([]);
  res.json(await User.find({ skillsOffered: { $regex: escapeRegex(skill), $options: "i" } }).select("-password -email -__v").limit(100));
};
router.get("/match/:skill", requireAuth, matchSkill);
router.get("/recommend/:skill", requireAuth, matchSkill); // kept so older clients keep working

router.put("/update/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid user id" });
  if (String(req.user._id) !== id) return res.status(403).json({ message: "You can only edit your own profile" });
  const b = req.body || {};
  const patch = {};
  const email = str(b.email, 320).toLowerCase();  // name is permanent: bookings and chats refer to it
  if (email) {
    if (!isEmail(email)) return res.status(400).json({ message: "Enter a valid email" });
    if (await User.findOne({ email, _id: { $ne: id } })) return res.status(409).json({ message: "That email is already in use" });
    patch.email = email;
  }
  if (Array.isArray(b.skillsOffered)) patch.skillsOffered = skillList(b.skillsOffered);
  if (Array.isArray(b.skillsWanted)) patch.skillsWanted = skillList(b.skillsWanted);
  const updated = await User.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
  res.json(publicUser(updated));
});

// Permanently delete the logged-in user's account and everything tied to it.
// Requires the current password so a stolen session can't wipe an account.
router.delete("/account", requireAuth, authLimiter, async (req, res) => {
  const password = typeof req.body?.password === "string" ? req.body.password.slice(0, 128) : "";
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "Account not found" });
  const ok = isHash(user.password) ? await bcrypt.compare(password, user.password) : user.password === password;
  if (!password || !ok) return res.status(400).json({ message: "Incorrect password" });
  const name = user.name;
  await Promise.all([
    Booking.deleteMany({ $or: [{ learner: name }, { mentor: name }] }),
    Message.deleteMany({ $or: [{ sender: name }, { receiver: name }] }),
    Review.deleteMany({ $or: [{ learner: name }, { mentor: name }] }),
    Notification.deleteMany({ user: name }),
  ]);
  await User.deleteOne({ _id: user._id });
  res.json({ message: "Account deleted" });
});

module.exports = router;
