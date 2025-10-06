const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "https://net-global-connect.netlify.app",
        "https://playful-raindrop-fed49f.netlify.app",
        "https://amazing-gumption-6b73bc.netlify.app",
        "https://68e3c7ec8eb297e7aa5fdae2--amazing-gumption-6b73bc.netlify.app",
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Not authorized"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Token invalid"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.email);

    socket.on("join", (userId) => {
      socket.join(userId); 
    });

    socket.on("private_message", async ({ content, to }) => {
      if (!content || !to) return;

      const message = await Message.create({
        senderId: socket.user.id,
        receiverId: to,
        content,
      });

      // Emit to sender
      socket.emit("private_message", message);
      // Emit to receiver if online
      socket.to(to).emit("private_message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.email);
    });
  });
};

module.exports = { initSocket, io };
