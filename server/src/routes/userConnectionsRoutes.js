const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  listConnections,
  listConnectionRequests,
} = require("../controllers/userConnectionsController");

// Send request
router.post("/connect/:id", protect, sendConnectionRequest);

// Accept request
router.post("/accept/:id", protect, acceptConnectionRequest);

// Reject request
router.post("/reject/:id", protect, rejectConnectionRequest);

// List connections
router.get("/connections", protect, listConnections);

// List pending requests
router.get("/requests", protect, listConnectionRequests);

module.exports = router;
