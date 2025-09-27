const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getProfile,
  updateProfile,
  getUserById,
} = require("../controllers/userController");

// Current logged-in user profile
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

// Get any user by ID
router.get("/:id", protect, getUserById);

module.exports = router;
