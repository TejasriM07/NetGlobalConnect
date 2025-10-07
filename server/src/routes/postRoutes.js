const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { protect, roleCheck } = require("../middlewares/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create Post - any logged-in user
router.post("/", protect, upload.single("image"), postController.createPost);

// Update Post - only creator
router.put(
  "/:postId",
  protect,
  upload.single("image"),
  postController.updatePost
);

// Delete Post - creator or admin
router.delete("/:postId", protect, postController.deletePost);

// Report Post - any user
router.post("/:postId/report", protect, postController.reportPost);

// List all posts
router.get("/", protect, postController.listPosts);

// Get posts by specific user
router.get("/user/:userId", protect, postController.getUserPosts);

// Admin: list reported posts
router.get("/reported", protect, roleCheck(["Admin"]), postController.listReportedPosts);

// Like Post
router.post("/:postId/like", protect, postController.likePost);

// Comment on Post
router.post("/:postId/comment", protect, postController.commentPost);


module.exports = router;
