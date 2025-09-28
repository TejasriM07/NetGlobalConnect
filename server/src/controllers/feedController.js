const asyncHandler = require("../middlewares/asyncHandler");
const Post = require("../models/Post");
const User = require("../models/User");

// Get user feed
exports.getUserFeed = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  // Fetch logged-in user
  const user = await User.findById(userId).populate("connections");

  if (!user) return res.status(404).json({ message: "User not found" });

  // Get all connection IDs + self
  const connectionIds = user.connections.map((c) => c._id.toString());
  connectionIds.push(user._id.toString());

  // Fetch posts from connections
  let posts = await Post.find({ author: { $in: connectionIds } })
    .populate("author", "name profilePic role skills education experience")
    .sort({ createdAt: -1 }); // latest posts first

  // Optional: Prioritize posts based on skills/education/experience match
  // e.g., posts by users who share skills with logged-in user
  const userSkills = user.skills || [];
  const userExperience = user.experience || [];
  const userEducation = user.education || [];

  posts = posts.map((post) => {
    let score = 0;

    const author = post.author;
    if (author.skills && author.skills.some((s) => userSkills.includes(s)))
      score += 3;
    if (
      author.education &&
      author.education.some((e) =>
        userEducation.map((ed) => ed.school).includes(e.school)
      )
    )
      score += 2;
    if (
      author.experience &&
      author.experience.some((ex) =>
        userExperience.map((uEx) => uEx.company).includes(ex.company)
      )
    )
      score += 1;

    return { ...post._doc, score };
  });

  // Sort posts by score first, then by date
  posts.sort(
    (a, b) => b.score - a.score || new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.status(200).json({ count: posts.length, posts });
});
