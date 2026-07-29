const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

// connect database
mongoose.connect("mongodb://127.0.0.1:27017/Exora")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// routes
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("API Running...");
});
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/booking", bookingRoutes);

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/review", reviewRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});