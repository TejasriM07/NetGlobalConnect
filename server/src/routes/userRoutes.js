const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getProfile,
  updateProfile,
  getUserById,
  getResume,
} = require("../controllers/userController");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Current logged-in user profile
router.get("/me", protect, getProfile);

// Update profile with optional profilePic and resume (PDF only)
router.put(
  "/me",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateProfile
);

router.get("/:id/resume", protect, getResume);

// Get any user by ID
router.get("/:id", protect, getUserById);

module.exports = router;
