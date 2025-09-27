const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { uploadStream } = require("../utils/cloudinary");

// Register user (optional profile image)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character",
      });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    let profile = null;
    if (req.file && req.file.buffer) {
      const uploadRes = await uploadStream(req.file.buffer); // Upload to Cloudinary
      profile = { url: uploadRes.secure_url, publicId: uploadRes.public_id };
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashed,
      profilePic: profile,
      role: role || "JobSeeker",
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    return res.status(201).json({ success: true, data: user.toJSON(), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    return res.json({ success: true, data: user.toJSON(), token });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Google OAuth login
const oauthLogin = async (req, res) => {
  try {
    if (!req.userDoc)
      return res.status(500).json({ success: false, message: "OAuth failed" });

    const userDoc = req.userDoc;
    const token = generateToken({
      id: userDoc._id,
      email: userDoc.email,
      role: userDoc.role,
    });

    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontend}/oauth-success?token=${token}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth callback error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, oauthLogin };
