// routes/messages.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadMessagesCount,
} = require("../controllers/messageController");

router.post("/", protect, sendMessage);
router.get("/conversations", protect, getConversations);
router.get("/unread-count", protect, getUnreadMessagesCount);
router.get("/:userId", protect, getMessages);

module.exports = router;
