const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/services", require("./routes/services"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/providers", require("./routes/providers"));
app.use("/api/ai", require("./routes/ai"));

// Socket.io for live tracking
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_booking", (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });

  socket.on("update_location", ({ bookingId, lat, lng }) => {
    io.to(`booking_${bookingId}`).emit("provider_location", { lat, lng });
  });

  socket.on("booking_status_update", ({ bookingId, status }) => {
    io.to(`booking_${bookingId}`).emit("status_changed", { status });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`QuickServe server running on port ${PORT}`));
