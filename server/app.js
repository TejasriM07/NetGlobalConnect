require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const passport = require("passport");

const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const feedRoutes = require("./src/routes/feedRoutes");
const postRoutes = require("./src/routes/postRoutes");
const searchRoutes = require("./src/routes/searchRoutes");
require("./src/services/googleAuthService");

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
app.use("/api/search", searchRoutes);
app.use(
  "/api/users/connections",
  require("./src/routes/userConnectionsRoutes")
);
app.use("/api/messages", require("./src/routes/messageRoutes"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Server Error";
  res.status(status).json({ success: false, message });
});

module.exports = app;
