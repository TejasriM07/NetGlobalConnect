const express = require("express");
const router = express.Router();
const { unifiedSearch } = require("../controllers/searchController");
const { protect } = require("../middlewares/authMiddleware"); // your JWT middleware

// GET /api/search?q=...&type=...&sortBy=...&role=...
router.get("/", protect, unifiedSearch);

module.exports = router;
