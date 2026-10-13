const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { userFromToken } = require("./middleware/auth");
const { securityHeaders, rateLimit } = require("./middleware/security");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Exora";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "20kb" }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 300, message: "Slow down a little" }));

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

app.get("/", (req, res) => res.send("API Running..."));
app.use("/api", require("./routes/userRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Last-resort error handler: JSON out, no stack traces or internals leaked.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON" });
  if (err.type === "entity.too.large") return res.status(413).json({ message: "Request too large" });
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] }, maxHttpBufferSize: 1e5 });
app.set("io", io);

// Each socket must present a valid JWT and only receives its own messages.
io.use(async (socket, next) => {
  const user = await userFromToken(socket.handshake.auth?.token);
  if (!user) return next(new Error("unauthorized"));
  socket.join("user:" + user.name);
  next();
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
