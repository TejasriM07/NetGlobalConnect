const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { uploadStream } = require("../utils/cloudinary");

// --- Register user ---
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
          "Password must be at least 8 characters, include uppercase, lowercase, number, special char",
      });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });

    let profile = null;
    if (req.file && req.file.buffer) {
      const uploadRes = await uploadStream(req.file.buffer);
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

// --- Login user ---
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

// --- Google OAuth login ---
const oauthLogin = async (req, res) => {
  try {
    console.log('OAuth login callback triggered');
    console.log('req.userDoc:', req.userDoc ? 'exists' : 'missing');
    
    if (!req.userDoc)
      return res.status(500).json({ success: false, message: "OAuth failed" });

    const userDoc = req.userDoc;
    console.log('Generating token for user:', userDoc.email);
    
    const token = generateToken({
      id: userDoc._id,
      email: userDoc.email,
      role: userDoc.role,
    });

    // 🔹 Redirect to frontend root page with token for auto-login
    const frontend = process.env.FRONTEND_URL || "https://playful-raindrop-fed49f.netlify.app";
    const redirectUrl = `${frontend}/?token=${token}`;
    console.log('Redirecting to:', redirectUrl);
    
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth callback error", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, login, oauthLogin };
