const User = require("../models/User");
const { uploadStream } = require("../utils/cloudinary");

// Get logged-in user profile
const getProfile = async (req, res) => {
  try {
    return res.json({ success: true, data: req.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update profile (optional profile image)
const updateProfile = async (req, res) => {
  try {
    const updates = req.body; // name, bio, skills, etc.

    // Handle profile image
    if (req.file && req.file.buffer) {
      const uploadRes = await uploadStream(req.file.buffer);
      updates.profilePic = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); 
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, getUserById };
