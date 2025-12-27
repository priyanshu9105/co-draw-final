const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  
  // 1. Join Room Event
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Drawing Event (Only to specific room)
  socket.on("draw-line", ({ prevPoint, currentPoint, color, width, mode, roomId }) => {
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(roomId).emit("draw-line", { prevPoint, currentPoint, color, width, mode });
  });

  // 3. Clear Event (Only to specific room)
  socket.on("clear", (roomId) => {
    socket.to(roomId).emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING on port 3001 🚀");
});