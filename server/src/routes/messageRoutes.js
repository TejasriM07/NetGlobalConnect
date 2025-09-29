const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getMessages);

module.exports = router;
