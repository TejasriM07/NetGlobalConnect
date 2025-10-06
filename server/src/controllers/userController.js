const User = require("../models/User");
const { uploadStream, getSignedResumeUrl } = require("../utils/cloudinary");

// Get logged-in user profile
const getProfile = async (req, res) => {
  try {
    return res.json({ success: true, data: req.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get signed resume URL for a user
const getResume = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.resume?.publicId) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    const signedUrl = getSignedResumeUrl(user.resume.publicId, 300, { attachment: false });

    return res.json({ success: true, url: signedUrl });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate resume URL" });
  }
};


// Update profile (optional profile image)
const updateProfile = async (req, res) => {
  try {
    const updates = req.body; // name, bio, skills, etc.

    // Handle profile image
    if (req.files?.profilePic?.[0]) {
      const uploadRes = await uploadStream(req.files.profilePic[0].buffer);
      updates.profilePic = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    // Handle resume (PDF only)
    if (req.files?.resume?.[0]) {
      const file = req.files.resume[0];
      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed for resume",
        });
      }

      const uploadRes = await uploadStream(
        file.buffer,
        "global_connect_resumes"
      );
      updates.resume = {
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

module.exports = { getProfile, updateProfile, getUserById, getResume };
