const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("JWT_SECRET must be set in production.");
    process.exit(1);
  }
  console.warn("JWT_SECRET not set — using an insecure development default.");
}

const sign = (user) => jwt.sign({ id: String(user._id) }, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });

// Resolves a bearer token to { _id, name } or null.
async function userFromToken(token) {
  try {
    if (typeof token !== "string") return null;
    const { id } = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    return await User.findById(id).select("name");
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const user = header.startsWith("Bearer ") ? await userFromToken(header.slice(7)) : null;
  if (!user) return res.status(401).json({ message: "Please log in" });
  req.user = user;
  next();
}

module.exports = { requireAuth, userFromToken, sign };
