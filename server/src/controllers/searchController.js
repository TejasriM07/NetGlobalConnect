const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");

// Unified search with filters
const unifiedSearch = async (req, res) => {
  try {
    const { q, type, sortBy, role } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = { $regex: q, $options: "i" };
    const response = {};

    // ===== Users =====
    if (!type || type === "users") {
      const userFilter = {
        name: searchRegex,
        _id: { $ne: req.user._id },
      };
      if (role) userFilter.role = role;

      let userQuery = User.find(userFilter).select(
        "name email profilePic role"
      );

      if (sortBy === "date") {
        userQuery = userQuery.sort({ createdAt: -1 });
      }

      response.users = await userQuery;
    }

    // ===== Posts =====
    if (!type || type === "posts") {
      // Populate 'userId' instead of 'author'
      let postQuery = Post.find({ content: searchRegex }).populate(
        "userId",
        "name email profilePic role"
      );

      if (sortBy === "date") {
        postQuery = postQuery.sort({ createdAt: -1 });
      } else if (sortBy === "likes") {
        postQuery = postQuery.sort({ likesCount: -1 });
      } else if (sortBy === "comments") {
        postQuery = postQuery.sort({ commentsCount: -1 });
      }

      response.posts = await postQuery;
    }

    // ===== Jobs =====
    if (!type || type === "jobs") {
      let jobQuery = Job.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { company: searchRegex },
        ],
      }).select("title description company location createdAt");

      if (sortBy === "date") {
        jobQuery = jobQuery.sort({ createdAt: -1 });
      }

      response.jobs = await jobQuery;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { unifiedSearch };
