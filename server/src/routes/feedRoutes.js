const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const feedController = require("../controllers/feedController");

// GET user feed
router.get("/:userId", protect, feedController.getUserFeed);

module.exports = router;
