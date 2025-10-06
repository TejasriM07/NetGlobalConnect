const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

// Get all notifications for current user
router.get("/", protect, getNotifications);

// Get unread notification count
router.get("/unread-count", protect, getUnreadCount);

// Mark notification as read
router.put("/:notificationId/read", protect, markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", protect, markAllAsRead);

// Delete notification
router.delete("/:notificationId", protect, deleteNotification);

module.exports = router;