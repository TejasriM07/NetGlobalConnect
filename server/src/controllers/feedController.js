const Post = require("../models/Post");
const User = require("../models/User");

// Get user feed
const getUserFeed = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Include self and connections
    const ids = [user._id, ...user.connections];

    const posts = await Post.find({ userId: { $in: ids } }).sort({
      createdAt: -1,
    });

    res.status(200).json({ posts, count: posts.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUserFeed,
};
