const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile
} = require("../controllers/authController");

// Register with optional profile image upload
router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile", authMiddleware, upload.single("profileImage"), updateProfile);

module.exports = router;
