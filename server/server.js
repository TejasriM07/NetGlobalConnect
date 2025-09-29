require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const http = require("http");
const connectDB = require("./src/config/db");
const app = require("./app"); 
const { initSocket } = require("./src/services/socketService");

const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");

const connectDB = require('./src/config/db');
const jobRoutes =require ('./src/routes/jobRoutes')
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require("./src/routes/userRoutes");
const feedRoutes = require("./src/routes/feedRoutes");
const postRoutes = require("./src/routes/postRoutes");
require("./src/services/googleAuthService");

const PORT = process.env.PORT || 5000;

// Socket.IO service
const { initSocket } = require("./src/services/socketService");

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/posts/feed", feedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users/connections", require("./src/routes/userConnectionsRoutes"));
app.use("/api/messages", require("./src/routes/messageRoutes"));
app.use('/api/jobs',jobRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Server Error";
  res.status(status).json({ success: false, message });
});

// Creating HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });
