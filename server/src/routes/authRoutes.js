const express = require("express");
const router = express.Router();
const multer = require("multer");
const passport = require("passport");

const {
  register,
  login,
  oauthLogin,
} = require("../controllers/authController");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  async (req, res, next) => {
    req.userDoc = req.user;
    return oauthLogin(req, res, next);
  }
);

router.get("/google/failure", (req, res) => {
  res
    .status(401)
    .json({ success: false, message: "Google Authentication Failed" });
});

module.exports = router;
