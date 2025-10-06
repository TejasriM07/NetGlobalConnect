const Post = require("../models/Post");
const { createNotification } = require("./notificationController");
const {
  uploadStream,
  deleteByPublicId,
} = require("../utils/cloudinary");

// Create Post
exports.createPost = async (req, res) => {
  try {
    let image = null;
    if (req.file) {
      const result = await uploadStream(
        req.file.buffer,
        "global_connect_posts"
      );
      image = { url: result.secure_url, publicId: result.public_id };
    }

    const post = await Post.create({
      userId: req.user._id,
      content: req.body.content,
      image,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update Post (creator only)
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Forbidden" });

    if (req.body.content) post.content = req.body.content;

    // Replace image if new one uploaded
    if (req.file) {
      if (post.image?.publicId) await deleteByPublicId(post.image.publicId);
      const result = await uploadStream(
        req.file.buffer,
        "global_connect_posts"
      );
      post.image = { url: result.secure_url, publicId: result.public_id };
    }

    await post.save();
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete Post (creator or admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (
      post.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "Admin"
    )
      return res.status(403).json({ success: false, message: "Forbidden" });

    if (post.image?.publicId) await deleteByPublicId(post.image.publicId);

    await post.deleteOne(); // <-- updated here

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Report Post
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    if (!post.reportedBy.includes(req.user._id)) {
      post.reportedBy.push(req.user._id);
      await post.save();
    }

    res.status(200).json({ success: true, message: "Post reported" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List all posts
exports.listPosts = async (req, res) => {
  try {
    console.log("Fetching posts...");
    const posts = await Post.find()
      .populate("userId", "name email profilePic")
      .populate("comments.userId", "name email profilePic")
      .sort({ createdAt: -1 });

    console.log(`Found ${posts.length} posts`);
    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// List all reported posts (Admin only)
exports.listReportedPosts = async (req, res) => {
  try {
    // Only posts with at least one report
    const reportedPosts = await Post.find({ reportedBy: { $exists: true, $ne: [] } })
      .populate("userId", "name email")
      .populate("reportedBy", "name email")
      .populate("comments.userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reportedPosts.length, reportedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Like on post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("userId", "name");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes.push(userId);
      
      // Create notification for post owner
      await createNotification({
        recipient: post.userId._id,
        sender: userId,
        type: "like",
        message: `${req.user.name} liked your post`,
        relatedPost: post._id,
      });
    }

    await post.save();
    res.status(200).json({ success: true, message: isLiked ? "Post unliked" : "Post liked", likes: post.likes.length });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Comment on post
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Comment text is required" });

    const post = await Post.findById(req.params.postId).populate("userId", "name");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const newComment = { userId: req.user._id, text };
    post.comments.push(newComment);
    await post.save();

    // Create notification for post owner
    await createNotification({
      recipient: post.userId._id,
      sender: req.user._id,
      type: "comment",
      message: `${req.user.name} commented on your post: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
      relatedPost: post._id,
    });

    res.status(201).json({ success: true, message: "Comment added", comment: newComment });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
